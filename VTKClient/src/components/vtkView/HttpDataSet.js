// For vtk factory
import 'vtk.js/Sources/Common/DataModel/ImageData';
import 'vtk.js/Sources/Common/DataModel/PolyData';
import 'vtk.js/Sources/favicon';
import ReactDOM from 'react-dom';
import React from 'react';
import { Spin } from 'antd';
import vtk from 'vtk.js/Sources/vtk';
import DataAccessHelper from 'vtk.js/Sources/IO/Core/DataAccessHelper';
import vtkDataArray from 'vtk.js/Sources/Common/Core/DataArray';
import vtkStringArray from 'vtk.js/Sources/Common/Core/StringArray';
import pako from 'pako';
import Endian from 'vtk.js/Sources/Common/Core/Endian';
import { DataTypeByteSize } from 'vtk.js/Sources/Common/Core/DataArray/Constants';

let globalMTime = 0;
let requestCount = 0;

const fieldDataLocations = ['pointData', 'cellData', 'fieldData'];
const HTTP_DATA_ACCESS = DataAccessHelper.get('http');
const loggerFunctions = {
	debug: noOp, // Don't print debug by default
	error: global.console.error || noOp,
	info: global.console.info || noOp,
	log: global.console.log || noOp,
	warn: global.console.warn || noOp,
};
const ARRAY_BUILDERS = {
	vtkDataArray,
	vtkStringArray,
};
const objectSetterMap = {
	enum(publicAPI, model, field) {
		return (value) => {
			if (typeof value === 'string') {
				if (field.enum[value] !== undefined) {
					if (model[field.name] !== field.enum[value]) {
						model[field.name] = field.enum[value];
						publicAPI.modified();
						return true;
					}
					return false;
				}
				vtkErrorMacro(`Set Enum with invalid argument ${field}, ${value}`);
				throw new RangeError('Set Enum with invalid string argument');
			}
			if (typeof value === 'number') {
				if (model[field.name] !== value) {
					if (
						Object.keys(field.enum)
							.map((key) => field.enum[key])
							.indexOf(value) !== -1
					) {
						model[field.name] = value;
						publicAPI.modified();
						return true;
					}
					vtkErrorMacro(`Set Enum outside numeric range ${field}, ${value}`);
					throw new RangeError('Set Enum outside numeric range');
				}
				return false;
			}
			vtkErrorMacro(
				`Set Enum with invalid argument (String/Number) ${field}, ${value}`
			);
			throw new TypeError('Set Enum with invalid argument (String/Number)');
		};
	},
};
const EVENT_ABORT = Symbol('Event abort');
function noOp() { }
function capitalize(str) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}
function obj(publicAPI = {}, model = {}) {
	// Ensure each instance as a unique ref of array
	safeArrays(model);

	const callbacks = [];
	if (!Number.isInteger(model.mtime)) {
		model.mtime = ++globalMTime;
	}
	model.classHierarchy = ['vtkObject'];

	function off(index) {
		callbacks[index] = null;
	}

	function on(index) {
		function unsubscribe() {
			off(index);
		}
		return Object.freeze({
			unsubscribe,
		});
	}

	publicAPI.isDeleted = () => !!model.deleted;

	publicAPI.modified = (otherMTime) => {
		if (model.deleted) {
			vtkErrorMacro('instance deleted - cannot call any method');
			return;
		}

		if (otherMTime && otherMTime < publicAPI.getMTime()) {
			return;
		}

		model.mtime = ++globalMTime;
		callbacks.forEach((callback) => callback && callback(publicAPI));
	};

	publicAPI.onModified = (callback) => {
		if (model.deleted) {
			vtkErrorMacro('instance deleted - cannot call any method');
			return null;
		}

		const index = callbacks.length;
		callbacks.push(callback);
		return on(index);
	};

	publicAPI.getMTime = () => model.mtime;

	publicAPI.isA = (className) => {
		let count = model.classHierarchy.length;
		// we go backwards as that is more likely for
		// early termination
		while (count--) {
			if (model.classHierarchy[count] === className) {
				return true;
			}
		}
		return false;
	};

	publicAPI.getClassName = (depth = 0) =>
		model.classHierarchy[model.classHierarchy.length - 1 - depth];

	publicAPI.set = (map = {}, noWarning = false, noFunction = false) => {
		let ret = false;
		Object.keys(map).forEach((name) => {
			const fn = noFunction ? null : publicAPI[`set${capitalize(name)}`];
			if (fn && Array.isArray(map[name]) && fn.length > 1) {
				ret = fn(...map[name]) || ret;
			} else if (fn) {
				ret = fn(map[name]) || ret;
			} else {
				// Set data on model directly
				if (['mtime'].indexOf(name) === -1 && !noWarning) {
					vtkWarningMacro(
						`Warning: Set value to model directly ${name}, ${map[name]}`
					);
				}
				model[name] = map[name];
				ret = true;
			}
		});
		return ret;
	};

	publicAPI.get = (...list) => {
		if (!list.length) {
			return model;
		}
		const subset = {};
		list.forEach((name) => {
			subset[name] = model[name];
		});
		return subset;
	};

	publicAPI.getReferenceByName = (val) => model[val];

	publicAPI.delete = () => {
		Object.keys(model).forEach((field) => delete model[field]);
		callbacks.forEach((el, index) => off(index));

		// Flag the instance being deleted
		model.deleted = true;
	};

	// Add serialization support
	publicAPI.getState = () => {
		const jsonArchive = { ...model, vtkClass: publicAPI.getClassName() };

		// Convert every vtkObject to its serializable form
		Object.keys(jsonArchive).forEach((keyName) => {
			if (jsonArchive[keyName] === null || jsonArchive[keyName] === undefined) {
				delete jsonArchive[keyName];
			} else if (jsonArchive[keyName].isA) {
				jsonArchive[keyName] = jsonArchive[keyName].getState();
			} else if (Array.isArray(jsonArchive[keyName])) {
				jsonArchive[keyName] = jsonArchive[keyName].map(getStateArrayMapFunc);
			}
		});

		// Sort resulting object by key name
		const sortedObj = {};
		Object.keys(jsonArchive)
			.sort()
			.forEach((name) => {
				sortedObj[name] = jsonArchive[name];
			});

		// Remove mtime
		if (sortedObj.mtime) {
			delete sortedObj.mtime;
		}

		return sortedObj;
	};

	// Add shallowCopy(otherInstance) support
	publicAPI.shallowCopy = (other, debug = false) => {
		if (other.getClassName() !== publicAPI.getClassName()) {
			throw new Error(
				`Cannot ShallowCopy ${other.getClassName()} into ${publicAPI.getClassName()}`
			);
		}
		const otherModel = other.get();

		const keyList = Object.keys(model).sort();
		const otherKeyList = Object.keys(otherModel).sort();

		otherKeyList.forEach((key) => {
			const keyIdx = keyList.indexOf(key);
			if (keyIdx === -1) {
				if (debug) {
					vtkDebugMacro(`add ${key} in shallowCopy`);
				}
			} else {
				keyList.splice(keyIdx, 1);
			}
			model[key] = otherModel[key];
		});
		if (keyList.length && debug) {
			vtkDebugMacro(`Untouched keys: ${keyList.join(', ')}`);
		}

		publicAPI.modified();
	};

	// Allow usage as decorator
	return publicAPI;
}
function safeArrays(model) {
	Object.keys(model).forEach((key) => {
		if (Array.isArray(model[key])) {
			model[key] = [].concat(model[key]);
		}
	});
}
function vtkErrorMacro(...args) {
	loggerFunctions.error(...args);
}
function vtkWarningMacro(...args) {
	loggerFunctions.warn(...args);
}
function getStateArrayMapFunc(item) {
	if (item.isA) {
		return item.getState();
	}
	return item;
}
function vtkDebugMacro(...args) {
	loggerFunctions.debug(...args);
}
function get(publicAPI, model, fieldNames) {
	fieldNames.forEach((field) => {
		if (typeof field === 'object') {
			publicAPI[`get${capitalize(field.name)}`] = () => model[field.name];
		} else {
			publicAPI[`get${capitalize(field)}`] = () => model[field];
		}
	});
}
function set(publicAPI, model, fields) {
	fields.forEach((field) => {
		if (typeof field === 'object') {
			publicAPI[`set${capitalize(field.name)}`] = findSetter(field)(
				publicAPI,
				model
			);
		} else {
			publicAPI[`set${capitalize(field)}`] = findSetter(field)(
				publicAPI,
				model
			);
		}
	});
}
function findSetter(field) {
	if (typeof field === 'object') {
		const fn = objectSetterMap[field.type];
		if (fn) {
			return (publicAPI, model) => fn(publicAPI, model, field);
		}

		vtkErrorMacro(`No setter for field ${field}`);
		throw new TypeError('No setter for field');
	}
	return function getSetter(publicAPI, model) {
		return function setter(value) {
			if (model.deleted) {
				vtkErrorMacro('instance deleted - cannot call any method');
				return false;
			}

			if (model[field] !== value) {
				model[field] = value;
				publicAPI.modified();
				return true;
			}
			return false;
		};
	};
}
function getArray(publicAPI, model, fieldNames) {
	fieldNames.forEach((field) => {
		publicAPI[`get${capitalize(field)}`] = () => [].concat(model[field]);
		publicAPI[`get${capitalize(field)}ByReference`] = () => model[field];
	});
}
function algo(publicAPI, model, numberOfInputs, numberOfOutputs) {
	if (model.inputData) {
		model.inputData = model.inputData.map(vtk);
	} else {
		model.inputData = [];
	}

	if (model.inputConnection) {
		model.inputConnection = model.inputConnection.map(vtk);
	} else {
		model.inputConnection = [];
	}

	if (model.output) {
		model.output = model.output.map(vtk);
	} else {
		model.output = [];
	}

	if (model.inputArrayToProcess) {
		model.inputArrayToProcess = model.inputArrayToProcess.map(vtk);
	} else {
		model.inputArrayToProcess = [];
	}

	// Cache the argument for later manipulation
	model.numberOfInputs = numberOfInputs;

	// Methods
	function setInputData(dataset, port = 0) {
		if (model.deleted) {
			vtkErrorMacro('instance deleted - cannot call any method');
			return;
		}
		if (port >= model.numberOfInputs) {
			vtkErrorMacro(
				`algorithm ${publicAPI.getClassName()} only has ${
				model.numberOfInputs
				} input ports. To add more input ports, use addInputData()`
			);
			return;
		}
		if (model.inputData[port] !== dataset || model.inputConnection[port]) {
			model.inputData[port] = dataset;
			model.inputConnection[port] = null;
			if (publicAPI.modified) {
				publicAPI.modified();
			}
		}
	}

	function getInputData(port = 0) {
		if (model.inputConnection[port]) {
			model.inputData[port] = model.inputConnection[port]();
		}
		return model.inputData[port];
	}

	function setInputConnection(outputPort, port = 0) {
		if (model.deleted) {
			vtkErrorMacro('instance deleted - cannot call any method');
			return;
		}
		if (port >= model.numberOfInputs) {
			let msg = `algorithm ${publicAPI.getClassName()} only has `;
			msg += `${model.numberOfInputs}`;
			msg += ' input ports. To add more input ports, use addInputConnection()';
			vtkErrorMacro(msg);
			return;
		}
		model.inputData[port] = null;
		model.inputConnection[port] = outputPort;
	}

	function getInputConnection(port = 0) {
		return model.inputConnection[port];
	}

	function addInputConnection(outputPort) {
		if (model.deleted) {
			vtkErrorMacro('instance deleted - cannot call any method');
			return;
		}
		model.numberOfInputs++;
		setInputConnection(outputPort, model.numberOfInputs - 1);
	}

	function addInputData(dataset) {
		if (model.deleted) {
			vtkErrorMacro('instance deleted - cannot call any method');
			return;
		}
		model.numberOfInputs++;
		setInputData(dataset, model.numberOfInputs - 1);
	}

	function getOutputData(port = 0) {
		if (model.deleted) {
			vtkErrorMacro('instance deleted - cannot call any method');
			return null;
		}
		if (publicAPI.shouldUpdate()) {
			publicAPI.update();
		}
		return model.output[port];
	}

	publicAPI.shouldUpdate = () => {
		const localMTime = publicAPI.getMTime();
		let count = numberOfOutputs;
		let minOutputMTime = Infinity;
		while (count--) {
			if (!model.output[count]) {
				return true;
			}
			const mt = model.output[count].getMTime();
			if (mt < localMTime) {
				return true;
			}
			if (mt < minOutputMTime) {
				minOutputMTime = mt;
			}
		}

		count = model.numberOfInputs;
		while (count--) {
			if (
				model.inputConnection[count] &&
				model.inputConnection[count].filter.shouldUpdate()
			) {
				return true;
			}
		}

		count = model.numberOfInputs;
		while (count--) {
			if (
				publicAPI.getInputData(count) &&
				publicAPI.getInputData(count).getMTime() > minOutputMTime
			) {
				return true;
			}
		}
		return false;
	};

	function getOutputPort(port = 0) {
		const outputPortAccess = () => getOutputData(port);
		// Add reference to filter
		outputPortAccess.filter = publicAPI;
		return outputPortAccess;
	}

	// Handle input if needed
	if (model.numberOfInputs) {
		// Reserve inputs
		let count = model.numberOfInputs;
		while (count--) {
			model.inputData.push(null);
			model.inputConnection.push(null);
		}

		// Expose public methods
		publicAPI.setInputData = setInputData;
		publicAPI.setInputConnection = setInputConnection;
		publicAPI.addInputData = addInputData;
		publicAPI.addInputConnection = addInputConnection;
		publicAPI.getInputData = getInputData;
		publicAPI.getInputConnection = getInputConnection;
	}

	if (numberOfOutputs) {
		publicAPI.getOutputData = getOutputData;
		publicAPI.getOutputPort = getOutputPort;
	}

	publicAPI.update = () => {
		const ins = [];
		if (model.numberOfInputs) {
			let count = 0;
			while (count < model.numberOfInputs) {
				ins[count] = publicAPI.getInputData(count);
				count++;
			}
		}
		if (publicAPI.shouldUpdate() && publicAPI.requestData) {
			publicAPI.requestData(ins, model.output);
		}
	};

	publicAPI.getNumberOfInputPorts = () => model.numberOfInputs;
	publicAPI.getNumberOfOutputPorts = () =>
		numberOfOutputs || model.output.length;

	publicAPI.getInputArrayToProcess = (inputPort) => {
		const arrayDesc = model.inputArrayToProcess[inputPort];
		const ds = model.inputData[inputPort];
		if (arrayDesc && ds) {
			return ds[`get${arrayDesc.fieldAssociation}`]().getArray(
				arrayDesc.arrayName
			);
		}
		return null;
	};
	publicAPI.setInputArrayToProcess = (
		inputPort,
		arrayName,
		fieldAssociation,
		attributeType = 'Scalars'
	) => {
		while (model.inputArrayToProcess.length < inputPort) {
			model.inputArrayToProcess.push(null);
		}
		model.inputArrayToProcess[inputPort] = {
			arrayName,
			fieldAssociation,
			attributeType,
		};
	};
}
function event(publicAPI, model, eventName) {
	const callbacks = [];
	const previousDelete = publicAPI.delete;
	let curCallbackID = 1;

	function off(callbackID) {
		for (let i = 0; i < callbacks.length; ++i) {
			const [cbID] = callbacks[i];
			if (cbID === callbackID) {
				callbacks.splice(i, 1);
				return;
			}
		}
	}

	function on(callbackID) {
		function unsubscribe() {
			off(callbackID);
		}
		return Object.freeze({
			unsubscribe,
		});
	}

	function invoke() {
		if (model.deleted) {
			vtkErrorMacro('instance deleted - cannot call any method');
			return;
		}
		/* eslint-disable prefer-rest-params */
		// Go through a copy of the callbacks array in case new callbacks
		// get prepended within previous callbacks
		const currentCallbacks = callbacks.slice();
		for (let index = 0; index < currentCallbacks.length; ++index) {
			const [, cb, priority] = currentCallbacks[index];

			if (!cb) {
				continue; // eslint-disable-line
			}

			if (priority < 0) {
				setTimeout(() => cb.apply(publicAPI, arguments), 1 - priority);
			} else {
				// Abort only if the callback explicitly returns false
				const continueNext = cb.apply(publicAPI, arguments);
				if (continueNext === EVENT_ABORT) {
					break;
				}
			}
		}
		/* eslint-enable prefer-rest-params */
	}

	publicAPI[`invoke${capitalize(eventName)}`] = invoke;

	publicAPI[`on${capitalize(eventName)}`] = (callback, priority = 0.0) => {
		if (!callback.apply) {
			console.error(`Invalid callback for event ${eventName}`);
			return null;
		}

		if (model.deleted) {
			vtkErrorMacro('instance deleted - cannot call any method');
			return null;
		}

		const callbackID = curCallbackID++;
		callbacks.push([callbackID, callback, priority]);
		callbacks.sort((cb1, cb2) => cb2[2] - cb1[2]);
		return on(callbackID);
	};

	publicAPI.delete = () => {
		previousDelete();
		callbacks.forEach(([cbID]) => off(cbID));
	};
}
function newInstance(extend, className) {
	const constructor = (initialValues = {}) => {
		const model = {};
		const publicAPI = {};
		extend(publicAPI, model, initialValues);

		return Object.freeze(publicAPI);
	};

	// Register constructor to factory
	if (className) {
		vtk.register(className, constructor);
	}

	return constructor;
}
function fetchArrays(instance = {}, baseURL, array, options = {}) {
	if (array.ref && !array.ref.pending) {
		return new Promise((resolve, reject) => {
			const xhr = new XMLHttpRequest();
			const url = [
				baseURL,
				array.ref.basepath,
				options.compression ? `${array.ref.id}.gz` : array.ref.id,
			].join('/');
			xhr.onreadystatechange = (e) => {
				if (xhr.readyState === 1) {
					array.ref.pending = true;
					if (++requestCount === 1 && instance.invokeBusy) {
						instance.invokeBusy(true);
					}
				}
				if (xhr.readyState === 2) {
					var dom = document.createElement('div');
					dom.setAttribute('id', 'loading');
					document.getElementsByClassName('vtk-view')[0].appendChild(dom);
					ReactDOM.render(<Spin tip="加载中..." size="large" />, dom);
				}
				if (xhr.readyState === 4) {
					array.ref.pending = false;
					if (xhr.status === 200 || xhr.status === 0) {
						array.buffer = xhr.response;


						if (options.compression) {
							if (array.dataType === 'string' || array.dataType === 'JSON') {
								array.buffer = pako.inflate(new Uint8Array(array.buffer), {
									to: 'string',
								});
							} else {
								array.buffer = pako.inflate(
									new Uint8Array(array.buffer)
								).buffer;
							}
						}

						if (array.ref.encode === 'JSON') {
							array.values = JSON.parse(array.buffer);
						} else {
							if (Endian.ENDIANNESS !== array.ref.encode && Endian.ENDIANNESS) {
								// Need to swap bytes
								vtkDebugMacro(`Swap bytes of ${array.name}`);
								Endian.swapBytes(
									array.buffer,
									DataTypeByteSize[array.dataType]
								);
							}

							array.values = new window[array.dataType](array.buffer);
						}

						if (array.values.length !== array.size) {
							vtkErrorMacro(
								`Error in FetchArray: ${array.name}, does not have the proper array size. Got ${array.values.length}, instead of ${array.size}`
							);
						}

						// Done with the ref and work
						delete array.ref;
						if (--requestCount === 0 && instance.invokeBusy) {
							instance.invokeBusy(false);
						}
						if (instance.modified) {
							instance.modified();
						}
						resolve(array);
					} else {
						reject({ xhr, e });
					}
					document.getElementsByClassName('vtk-view')[0].removeChild(document.getElementById('loading'));
				}
			};

			if (options && options.progressCallback) {
				xhr.addEventListener('progress', options.progressCallback);
			}

			// Make request
			xhr.open('GET', url, true);
			xhr.responseType =
				options.compression || array.dataType !== 'string'
					? 'arraybuffer'
					: 'text';
			xhr.send();
		});
	}

	return Promise.resolve(array);
}
// ----------------------------------------------------------------------------
// Global methods
// ----------------------------------------------------------------------------
const GEOMETRY_ARRAYS = {
	vtkPolyData(dataset) {
		const arrayToDownload = [];
		arrayToDownload.push(dataset.points);
		['verts', 'lines', 'polys', 'strips'].forEach((cellName) => {
			if (dataset[cellName]) {
				arrayToDownload.push(dataset[cellName]);
			}
		});

		return arrayToDownload;
	},

	vtkImageData(dataset) {
		return [];
	},

	vtkUnstructuredGrid(dataset) {
		const arrayToDownload = [];
		arrayToDownload.push(dataset.points);
		arrayToDownload.push(dataset.cells);
		arrayToDownload.push(dataset.cellTypes);

		return arrayToDownload;
	},

	vtkRectilinearGrid(dataset) {
		const arrayToDownload = [];
		arrayToDownload.push(dataset.xCoordinates);
		arrayToDownload.push(dataset.yCoordinates);
		arrayToDownload.push(dataset.zCoordinates);

		return arrayToDownload;
	},
};

function processDataSet(
	publicAPI,
	model,
	dataset,
	fetchArray,
	resolve,
	reject,
	loadData
) {
	const enable = model.enableArray;

	// Generate array list
	model.arrays = [];

	fieldDataLocations.forEach((location) => {
		if (dataset[location]) {
			dataset[location].arrays
				.map((i) => i.data)
				.forEach((array) => {
					model.arrays.push({
						name: array.name,
						enable,
						location,
						array,
						registration: array.ref.registration || 'addArray',
					});
				});

			// Reset data arrays
			dataset[location].arrays = [];
		}
	});

	// Fetch geometry arrays
	const pendingPromises = [];
	const { progressCallback } = model;
	const compression = model.fetchGzip ? 'gz' : null;
	GEOMETRY_ARRAYS[dataset.vtkClass](dataset).forEach((array) => {
		pendingPromises.push(fetchArray(array, { compression, progressCallback }));
	});

	function success() {
		model.dataset = vtk(dataset);
		// console.log(model.dataset)

		if (!loadData) {
			model.output[0] = model.dataset;
			resolve(publicAPI, model.output[0]);
		} else {
			publicAPI.loadData().then(() => {
				model.output[0] = model.dataset;
				resolve(publicAPI, model.output[0]);
			});
		}
	}

	// Wait for all geometry array to be fetched
	if (pendingPromises.length) {
		Promise.all(pendingPromises).then(success, (err) => {
			reject(err);
		});
	} else {
		success();
	}
}

// ----------------------------------------------------------------------------
// vtkHttpDataSetReader methods
// ----------------------------------------------------------------------------

function vtkHttpDataSetReader(publicAPI, model) {
	// Set our className
	model.classHierarchy.push('vtkHttpDataSetReader');

	// Empty output by default
	model.output[0] = vtk({ vtkClass: 'vtkPolyData' });

	// Create default dataAccessHelper if not available
	if (!model.dataAccessHelper) {
		model.dataAccessHelper = HTTP_DATA_ACCESS;
	}

	// Internal method to fetch Array
	function fetchArray(array, options = {}) {
		return fetchArrays(
			publicAPI,
			model.baseURL,
			array,
			options
		);
	}
	// Fetch dataset (metadata)
	publicAPI.updateMetadata = (loadData = false) => {
		if (model.compression === 'zip') {
			return new Promise((resolve, reject) => {
				HTTP_DATA_ACCESS.fetchBinary(model.url).then(
					(zipContent) => {
						model.dataAccessHelper = DataAccessHelper.get('zip', {
							zipContent,
							callback: (zip) => {
								model.baseURL = '';
								model.dataAccessHelper.fetchJSON(publicAPI, 'index.json').then(
									(dataset) => {
										processDataSet(
											publicAPI,
											model,
											dataset,
											fetchArray,
											resolve,
											reject,
											loadData
										);
									},
									(error) => {
										reject(error);
									}
								);
							},
						});
					},
					(error) => {
						reject(error);
					}
				);
			});
		}
		return new Promise((resolve, reject) => {
			model.dataAccessHelper.fetchJSON(publicAPI, model.url).then(
				(dataset) => {
					processDataSet(
						publicAPI,
						model,
						dataset,
						fetchArray,
						resolve,
						reject,
						loadData
					);
				},
				(error) => {
					reject(error);
				}
			);
		});
	};

	// Set DataSet url
	publicAPI.setUrl = (url, options = {}) => {
		if (url.indexOf('index.json') === -1 && !options.fullpath) {
			model.baseURL = url;
			model.url = `${url}/index.json`;
		} else {
			model.url = url;

			// Remove the file in the URL
			const path = url.split('/');
			path.pop();
			model.baseURL = path.join('/');
		}

		model.compression = options.compression;

		// Fetch metadata
		return publicAPI.updateMetadata(!!options.loadData);
	};

	// Fetch the actual data arrays
	publicAPI.loadData = () => {
		const datasetObj = model.dataset;
		const arrayToFecth = model.arrays
			.filter((array) => array.enable)
			.filter((array) => array.array.ref)
			.map((array) => array.array);

		return new Promise((resolve, reject) => {
			const error = (e) => {
				reject(e);
			};

			const processNext = () => {
				if (arrayToFecth.length) {
					const { progressCallback } = model;
					const compression = model.fetchGzip ? 'gz' : null;
					fetchArray(arrayToFecth.pop(), {
						compression,
						progressCallback,
					}).then(processNext, error);
				} else if (datasetObj) {
					// Perform array registration on new arrays
					model.arrays
						.filter(
							(metaArray) => metaArray.registration && !metaArray.array.ref
						)
						.forEach((metaArray) => {
							const newArray = ARRAY_BUILDERS[
								metaArray.array.vtkClass
							].newInstance(metaArray.array);
							datasetObj[`get${capitalize(metaArray.location)}`]()[
								metaArray.registration
							](newArray);
							delete metaArray.registration;
						});
					datasetObj.modified();
					resolve(publicAPI, datasetObj);
				}
			};

			// Start processing queue
			processNext();
		});
	};

	publicAPI.requestData = (inData, outData) => {
		// do nothing loadData will eventually load up the data
	};

	// Toggle arrays to load
	publicAPI.enableArray = (location, name, enable = true) => {
		const activeArray = model.arrays.filter(
			(array) => array.name === name && array.location === location
		);
		if (activeArray.length === 1) {
			activeArray[0].enable = enable;
		}
	};

	// return Busy state
	publicAPI.isBusy = () => !!model.requestCount;
}

// ----------------------------------------------------------------------------
// Object factory
// ----------------------------------------------------------------------------

const DEFAULT_VALUES = {
	enableArray: true,
	fetchGzip: false,
	arrays: [],
	url: null,
	baseURL: null,
	requestCount: 0,
	// dataAccessHelper: null,
};

// ----------------------------------------------------------------------------

export function extend(publicAPI, model, initialValues = {}) {
	Object.assign(model, DEFAULT_VALUES, initialValues);

	// Build VTK API
	obj(publicAPI, model);
	get(publicAPI, model, [
		'enableArray',
		'fetchGzip',
		'url',
		'baseURL',
		'dataAccessHelper',
	]);
	set(publicAPI, model, ['dataAccessHelper', 'progressCallback']);
	getArray(publicAPI, model, ['arrays']);
	algo(publicAPI, model, 0, 1);
	event(publicAPI, model, 'busy');

	// Object methods
	vtkHttpDataSetReader(publicAPI, model);

	// Make sure we can destructuring progressCallback from model
	if (model.progressCallback === undefined) {
		model.progressCallback = null;
	}
}

// ----------------------------------------------------------------------------

export const newInstances = newInstance(extend, 'vtkHttpDataSetReader');

// ----------------------------------------------------------------------------

export default { newInstances, extend };
