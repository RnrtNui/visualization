package execfunc

import (
	"os"
	"path/filepath"
)

// WriteStlGeoFile 写 stl 转geo文件操作
func WriteStlGeoFile(processPath, fileNameT, fileName string) error {

	fileName = filepath.Join(processPath, fileName)
	// 存入内容
	var context string
	context = `Merge "` + fileNameT + `";
            DefineConstant[
              angle = {40, Min 20, Max 120, Step 1, Name "Parameters/Angle for surface detection"},
              forceParametrizablePatches = {0, Choices{0,1}, Name "Parameters/Create surfaces guaranteed to be parametrizable"},includeBoundary = 1,curveAngle = 180
            ];

			ClassifySurfaces{angle * Pi/180, includeBoundary, forceParametrizablePatches, curveAngle * Pi / 180};
            CreateGeometry;
            Surface Loop(1) = Surface{:};
            Volume(1) = {1};
            
            funny = DefineNumber[0, Choices{0,1},
              Name "Parameters/Apply funny mesh size field?" ];
            
            Field[1] = MathEval;
            If(funny)
              Field[1].F = "2*Sin((x+y)/5) + 30";
            Else
              Field[1].F = "20";
            EndIf
            Background Field = 1;`

	fd, _ := os.OpenFile(fileName, os.O_RDWR|os.O_CREATE|os.O_TRUNC, 0644)
	defer fd.Close()
	fd.Write([]byte(context))
	//fd.WriteString(fd, context)
	fd.Write([]byte("\n"))
	return nil
}

// WriteStpGeoFile 写 stp 转geo文件操作
func WriteStpGeoFile(processPath, fileNameT, fileName string) error {

	fileName = filepath.Join(processPath, fileName)
	// 存入内容
	var context string
	context = `SetFactory("OpenCASCADE");
				v() = ShapeFromFile("` + fileNameT + `");
				Mesh.CharacteristicLengthMin = 3;
				Mesh.CharacteristicLengthMax = 3;`

	fd, _ := os.OpenFile(fileName, os.O_RDWR|os.O_CREATE|os.O_TRUNC, 0644)
	defer fd.Close()
	fd.Write([]byte(context))
	//fd.WriteString(fd, context)
	fd.Write([]byte("\n"))
	return nil
}

// WriteIgsGeoFile 写 igs 转geo文件操作
func WriteIgsGeoFile(processPath, fileNameT, fileName string) error {

	fileName = filepath.Join(processPath, fileName)
	// 存入内容
	var context string
	context = `SetFactory("OpenCASCADE");
				v() = ShapeFromFile("` + fileNameT + `");
				Mesh.CharacteristicLengthMin = 3;
				Mesh.CharacteristicLengthMax = 3;`

	fd, _ := os.OpenFile(fileName, os.O_RDWR|os.O_CREATE|os.O_TRUNC, 0644)
	defer fd.Close()
	fd.Write([]byte(context))
	//fd.WriteString(fd, context)
	fd.Write([]byte("\n"))
	return nil
}
