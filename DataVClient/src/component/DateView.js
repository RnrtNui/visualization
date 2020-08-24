/**
* 文件名：/component/DateView.js
* 作者：鲁杨飞
* 创建时间：2020/8/24
* 文件描述：中国疫情地图显示。
* */
import React, { Component } from 'react';
import echarts from 'echarts';
import chinaData from 'echarts/map/json/china.json';
import 'echarts-gl/dist/echarts-gl.js';
// import axios from "axios";

echarts.registerMap('china', chinaData);

class DateView extends Component {
	constructor(props) {
		super(props);
		this.state = {
			fileName: '',
			data: {},
			myChart:{}
		}
	};
	
	show = () => {
		// if (this.props.match.params.file) {
		let file = { "type": "china", "fileName": "history.xlsx" };
		/*
		line:折线图，
		bar:柱状条形图，
		scatter:散点（气泡）图,
		effectScatter:带有涟漪特效动画的散点（气泡）图,
	
		*/
		// 获取数据
		var myChart1 = echarts.init(document.getElementById('main'));
		// 绘制图表
		let option = {};
		if (file.type === "china") {
			var days = ["1月20", "1月21", "1月22", "1月23", "1月24", "1月25", "1月26", "1月27", "1月28", "1月29", "1月30", "1月31", "2月1", "2月2", "2月3", "2月4", "2月5", "2月6", "2月7", "2月8", "2月9", "2月10", "2月11", "2月12", "2月13", "2月14", "2月15", "2月16", "2月17", "2月18", "2月19", "2月20", "2月21", "2月22", "2月23", "2月24", "2月25", "2月26", "2月27", "2月28", "2月29", "3月1", "3月2", "3月3", "3月4", "3月5", "3月6", "3月7", "3月8", "3月9", "3月10", "3月11", "3月12", "3月13", "3月14", "3月15", "3月16", "3月17", "3月18", "3月19", "3月20", "3月21", "3月22", "3月23", "3月24", "3月25", "3月26", "3月27", "3月28", "3月29", "3月30", "3月31", "4月1", "4月2",];

			var province = ['湖北', '广东', '浙江', '湖南', '河南', '安徽', '重庆', '山东', '江西', '四川', '江苏', '北京', '福建', '上海', '广西', '河北', '陕西', '云南', '海南', '黑龙江', '辽宁', '山西', '天津', '甘肃', '内蒙古', '新疆', '宁夏', '吉林', '贵州', '青海', '西藏', '澳门', '香港', '台湾', '南海诸岛'];
			// var news = ["钟南山：目前已肯定新型冠状病毒肺炎人传人", "钟南山：目前已肯定新型冠状病毒肺炎人传人", "深圳2名新型冠状病毒肺炎确诊患者痊愈出院", "黑龙江省报告确诊病例2例；天津出现聚集性发病；武汉小汤山医院定名火神山医院；首个新冠病毒检测试剂盒通过检验；150名解放军医护人员包机飞武汉", "1230人的医疗救治队驰援武汉；武汉半月内将建雷神山医院", "中央应对疫情领导小组：适当延长春节假期；武汉市长：目前有500多万人离开武汉", "浙江成功分离到新型冠状病毒毒株；安徽出现聚集性疫情", "广东首株新型冠状病毒毒株成功分离", "新冠肺炎确诊人数超过非典；北京疫情有转入扩散期迹象", "武汉病毒所筛出较好抑制病毒药物；湖北黄冈市卫健委主任唐志红被免职", "火神山医院将从2月3日起正式收治病人", "中国红十字会总会公布接受使用社会捐赠款物最新数据", "报告云监工，火神山医院完工！湖北科技厅：最快2小时可得出新冠病毒核酸检测结果", "工信部：核酸检测试剂产量是疑似患者40倍，已基本满足要求；发改委回应口罩紧缺问题：已按一倍以上规模组织产能", "杭州全市所有村庄、小区、单位实行封闭式管理；李兰娟院士发布重大抗病毒研究成果", "武汉方舱医院扩容至万余床位；抗病毒药物瑞德西韦临床试验在武汉启动", "全国非湖北地区新增确诊病例连降两日", "武汉开展全民体温监测；国家监察委派调查组调查李文亮有关问题", "武汉预计再增加5400床位收治轻症患者", "今起，武汉一天消毒两次", "全国新冠肺炎治愈比例已升至8.2%", "武汉：所有住宅小区实行封闭管理", "世界卫生组织将新冠状病毒命名为COVID-19", "湖北新增新冠肺炎确诊病例14840例 累计48206例", "2月13日0至24时，全国新增确诊病例5090例，累计确诊63851例", "钟南山指导研发快速检测试剂盒，采一滴血15分钟出结果", "全国非湖北地区新增确诊病例连降12天", "湖北孝感：所有城镇居民严禁外出", "钟南山：武汉现在看来还并没有停止人传人", "全国新增治愈出院首次超过新增确诊", "中央指导组批湖北指挥系统：非战时节奏", "湖北：新冠肺炎统计不允许核减已确诊病例", "全国累计治愈出院病例超2万例；武汉核酸检测存量清零", "全国21个省份零新增", "武汉24小时封闭管理将持续一段时间；全国多地下调疫情应急响应等级", "湖北以外地区新增确诊病例首次降至个位数", "武汉公布最早患者：去年12月发病", "钟南山：我们有信心，新冠疫情4月底基本控制", "香港渔护署检测发现狗对新冠肺炎测试呈弱阳性反应", "世卫组织：疫情全球风险级别由高上调为非常高", "全国现有疑似病例不足千人", "全球累计确诊87137例，意大利单日猛增50％", "中国境外共64个国家确诊新冠肺炎8774例；外媒：伊朗23名国会议员确诊感染新冠病毒", "外媒：伊朗23名国会议员确诊感染新冠病毒", "李文亮医生等被追授全国防疫先进个人称号", "全球疫情蔓延：韩国确诊数超6000 美国3州进入紧急状态", "全球新冠肺炎确诊病例突破10万；钟南山公布新检测方法 可区分新冠肺炎和流感", "全球新冠肺炎病例超10万 世卫组织呼吁各国采取强有力遏制措施", "全国已有5省份及澳门确诊病例清零；意大利死亡病例数暴增57％，死亡率升至全球最高", "武汉15家方舱医院全部休舱", "湖北潜江：取消第26号通告，继续严格管控人员全省通行；美国新冠肺炎确诊病例超1000例", "隔离酒店坍塌事故搜救完成，共29人遇难", "新冠病毒是美军带到武汉？外交部表态", "美国累计确诊新冠肺炎病例已上升至1992例；境外输入病例首次超过本土新增确诊", "首例境外输入病例被立案调查：从伊朗返回宁夏", "世卫组织：中国以外新冠肺炎确诊病例达72469例", "全球确诊近18万，死亡破7000；中央：组织援鄂医务人员分批撤离", "武汉现有疑似病例清零！", "全球新冠肺炎病例已超20万例", "全球累计新冠肺炎病例超过24万例", "3月20日全国新增确诊41例，均为境外输入", "全球确诊病例超30万 特朗普宣布纽约州出现重大灾难", "外国人不如实填报信息，不准入境", "两高：妨害国境卫生检疫罪犯罪主体含外国人和无国籍人员", "湖北除武汉机场外航班将尽快恢复", "外交部：中国已对83个国家提供紧急援助", "全球新冠肺炎确诊超52万 美国已成确诊人数最多国家", "3月29日起，国际航班将有大调整", "河南郏县发现两例新冠肺炎阳性检测者", "中央：突出做好无症状感染者防控；全球累计确诊超70万例 累计死亡超3万例", "今年高考延期一个月举行，湖北、北京待定", "全球确诊超80万例，意大利全国降半旗", "钟南山：全球疫情4月底出现拐点，国内不会有第二波疫情高峰；全球确诊超93万例 美国首超21万例确诊", "钟南山:新冠肺炎的尸体解剖非常重要"]
			var data = [
				[270, 14, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				[375, 26, 5, 1, 1, 0, 5, 1, 2, 2, 0, 10, 0, 6, 0, 0, 0, 1, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				[444, 32, 10, 4, 5, 1, 9, 6, 3, 5, 1, 14, 1, 16, 2, 1, 4, 0, 5, 1, 2, 1, 4, 0, 0, 0, 1, 1, 3, 0, 0, 1, 1, 1, 0],
				[549, 53, 43, 24, 9, 15, 27, 9, 7, 15, 9, 22, 4, 20, 13, 2, 5, 2, 8, 4, 4, 1, 5, 2, 1, 2, 2, 3, 3, 0, 0, 2, 2, 1, 0],
				[729, 78, 62, 43, 32, 39, 57, 21, 18, 28, 18, 36, 10, 33, 23, 8, 15, 5, 17, 9, 12, 6, 8, 4, 2, 3, 3, 4, 4, 0, 0, 2, 5, 3, 0],
				[1052, 98, 104, 69, 83, 60, 75, 39, 36, 44, 31, 41, 18, 40, 33, 13, 22, 11, 22, 15, 16, 9, 10, 7, 7, 4, 4, 4, 5, 1, 0, 2, 5, 3, 0],
				[1423, 146, 128, 100, 128, 70, 110, 63, 48, 69, 47, 68, 35, 53, 46, 18, 35, 19, 31, 21, 22, 13, 14, 14, 11, 5, 7, 6, 7, 4, 0, 5, 8, 4, 0],
				[2714, 188, 173, 143, 168, 106, 132, 63, 72, 90, 70, 80, 59, 66, 51, 33, 46, 44, 40, 30, 27, 20, 23, 19, 13, 10, 11, 8, 9, 6, 0, 7, 8, 5, 0],
				[3554, 241, 296, 221, 206, 152, 147, 121, 109, 108, 99, 91, 80, 80, 58, 48, 56, 51, 43, 37, 34, 27, 24, 24, 16, 13, 12, 9, 9, 6, 0, 7, 8, 8, 0],
				[4586, 311, 428, 277, 206, 200, 165, 145, 162, 142, 129, 114, 101, 101, 78, 65, 63, 70, 46, 43, 41, 35, 27, 26, 18, 14, 17, 14, 12, 6, 1, 7, 10, 8, 0],
				[5806, 393, 537, 332, 352, 237, 206, 178, 240, 177, 168, 132, 120, 128, 87, 82, 87, 80, 49, 59, 45, 39, 31, 29, 20, 17, 21, 14, 15, 8, 1, 7, 12, 9, 0],
				[7153, 520, 599, 389, 422, 297, 238, 202, 286, 207, 202, 156, 144, 153, 100, 96, 101, 91, 57, 80, 60, 47, 32, 35, 23, 18, 26, 17, 29, 9, 1, 7, 13, 10, 0],
				[9074, 604, 661, 463, 493, 340, 262, 225, 333, 231, 236, 183, 159, 177, 111, 104, 116, 99, 63, 95, 64, 56, 41, 40, 27, 21, 28, 23, 38, 9, 1, 7, 14, 10, 0],
				[11177, 683, 724, 521, 566, 408, 300, 246, 391, 254, 271, 212, 179, 193, 127, 113, 128, 109, 70, 118, 70, 66, 48, 51, 34, 24, 31, 31, 46, 13, 1, 8, 15, 10, 0],
				[13522, 797, 829, 593, 675, 480, 337, 270, 476, 282, 308, 228, 194, 208, 139, 126, 142, 117, 79, 155, 74, 74, 60, 55, 35, 29, 34, 42, 56, 15, 1, 8, 15, 10, 0],
				[16678, 870, 895, 661, 764, 530, 366, 298, 548, 301, 341, 253, 205, 233, 150, 135, 165, 122, 89, 190, 81, 81, 67, 57, 42, 32, 34, 54, 64, 17, 1, 10, 18, 11, 0],
				[19665, 944, 954, 711, 851, 591, 389, 343, 600, 321, 373, 274, 215, 254, 168, 157, 173, 128, 100, 227, 89, 90, 69, 62, 46, 36, 40, 59, 69, 18, 1, 10, 21, 11, 0],
				[22112, 1018, 1006, 772, 914, 665, 411, 379, 661, 344, 408, 297, 224, 269, 172, 171, 184, 135, 111, 277, 95, 96, 79, 67, 50, 39, 43, 65, 77, 18, 1, 10, 24, 16, 0],
				[24953, 1075, 1048, 803, 980, 733, 426, 407, 698, 363, 439, 315, 239, 281, 183, 195, 184, 138, 122, 281, 99, 104, 81, 71, 52, 42, 44, 69, 89, 18, 1, 10, 26, 16, 0],
				[27013, 1120, 1075, 838, 1033, 779, 446, 435, 739, 386, 468, 326, 250, 292, 195, 206, 195, 140, 128, 307, 106, 115, 88, 79, 54, 45, 45, 78, 96, 18, 1, 10, 26, 17, 0],
				[29631, 1151, 1092, 879, 1073, 830, 468, 459, 772, 405, 492, 337, 261, 295, 210, 218, 208, 141, 136, 331, 108, 119, 91, 83, 58, 49, 49, 80, 109, 18, 1, 10, 36, 18, 0],
				[31728, 1177, 1117, 912, 1105, 860, 486, 486, 804, 417, 515, 342, 267, 302, 215, 239, 213, 149, 142, 360, 108, 122, 95, 86, 58, 55, 53, 81, 118, 18, 1, 10, 42, 18, 0],

				[33366, 1219, 1131, 946, 1135, 888, 505, 497, 844, 436, 543, 352, 272, 306, 222, 251, 219, 154, 145, 378, 116, 124, 106, 86, 60, 59, 58, 83, 131, 18, 1, 10, 49, 18, 0],
				[47163, 1241, 1145, 968, 1169, 910, 518, 506, 872, 451, 570, 366, 279, 313, 222, 265, 225, 155, 157, 395, 116, 126, 112, 87, 61, 63, 64, 84, 135, 18, 1, 10, 50, 18, 0],
				[51986, 1261, 1155, 988, 1184, 934, 529, 519, 900, 463, 593, 372, 281, 318, 226, 283, 229, 162, 157, 418, 116, 126, 119, 90, 65, 65, 67, 86, 140, 18, 1, 10, 53, 18, 0],
				[54406, 1294, 1162, 1001, 1212, 950, 537, 530, 913, 470, 604, 375, 285, 326, 235, 291, 230, 168, 162, 425, 119, 127, 120, 90, 68, 70, 70, 88, 143, 18, 1, 10, 56, 18, 0],
				[56249, 1316, 1167, 1004, 1231, 962, 544, 537, 925, 481, 617, 380, 287, 328, 237, 300, 232, 169, 162, 445, 120, 128, 122, 90, 70, 71, 70, 89, 144, 18, 1, 10, 56, 18, 0],
				[58182, 1322, 1171, 1006, 1246, 973, 551, 541, 930, 495, 626, 381, 290, 331, 238, 301, 236, 171, 162, 457, 121, 129, 124, 90, 72, 75, 70, 89, 146, 18, 1, 10, 57, 20, 0],
				[59989, 1328, 1172, 1007, 1257, 982, 553, 543, 933, 508, 629, 387, 292, 333, 242, 302, 240, 172, 163, 464, 121, 130, 125, 91, 73, 76, 70, 89, 146, 18, 1, 10, 60, 22, 0],
				[61682, 1331, 1173, 1008, 1261, 986, 555, 544, 933, 514, 631, 393, 293, 333, 244, 306, 240, 172, 163, 470, 121, 131, 128, 91, 75, 76, 71, 90, 146, 18, 1, 10, 62, 22, 0],
				[62457, 1332, 1175, 1010, 1265, 987, 560, 546, 934, 520, 631, 395, 293, 333, 245, 307, 242, 172, 168, 476, 121, 131, 130, 91, 75, 76, 71, 91, 146, 18, 1, 10, 65, 24, 0],
				[63088, 1333, 1215, 1011, 1267, 988, 567, 748, 934, 525, 631, 396, 293, 334, 246, 308, 245, 174, 168, 479, 121, 132, 131, 91, 75, 76, 71, 91, 146, 18, 1, 10, 68, 24, 0],
				[63454, 1339, 1217, 1013, 1270, 989, 572, 750, 934, 526, 631, 399, 293, 334, 249, 309, 245, 174, 168, 479, 121, 132, 133, 91, 75, 76, 71, 91, 146, 18, 1, 10, 68, 26, 0],

				[63889, 1342, 1217, 1016, 1271, 989, 573, 754, 934, 526, 631, 399, 293, 335, 249, 311, 245, 174, 168, 480, 121, 132, 135, 91, 75, 76, 71, 91, 146, 18, 1, 10, 69, 26, 0],
				[64287, 1345, 1217, 1016, 1271, 989, 575, 755, 934, 527, 631, 399, 293, 335, 251, 311, 245, 174, 168, 480, 121, 132, 135, 91, 75, 76, 71, 93, 146, 18, 1, 10, 74, 28, 0],
				[64786, 1347, 1217, 1016, 1271, 989, 576, 755, 934, 529, 631, 400, 294, 335, 252, 311, 245, 174, 168, 480, 121, 133, 135, 91, 75, 76, 71, 93, 146, 18, 1, 10, 81, 30, 0],
				[65187, 1347, 1217, 1016, 1271, 989, 576, 756, 934, 531, 631, 400, 294, 336, 252, 312, 245, 174, 168, 480, 121, 133, 135, 91, 75, 76, 71, 93, 146, 18, 1, 10, 85, 31, 0],
				[65596, 1347, 1217, 1017, 1272, 989, 576, 756, 934, 534, 631, 410, 296, 337, 252, 317, 245, 174, 168, 480, 121, 133, 135, 91, 75, 76, 72, 93, 146, 18, 1, 10, 91, 32, 0],
				[65914, 1348, 1217, 1017, 1272, 990, 576, 756, 935, 538, 631, 410, 296, 337, 252, 318, 245, 174, 168, 480, 121, 133, 136, 91, 75, 76, 72, 93, 146, 18, 1, 10, 93, 32, 0],
				[66337, 1349, 1217, 1018, 1272, 990, 576, 756, 935, 538, 631, 411, 296, 337, 252, 318, 245, 174, 168, 480, 121, 133, 136, 91, 75, 76, 73, 93, 146, 18, 1, 10, 94, 34, 0],
				[66907, 1349, 1217, 1018, 1272, 990, 576, 756, 935, 538, 631, 413, 296, 337, 252, 318, 245, 174, 168, 480, 122, 133, 136, 91, 75, 76, 73, 93, 146, 18, 1, 10, 95, 39, 0],
				[67103, 1350, 1218, 1018, 1272, 990, 576, 758, 935, 538, 631, 414, 296, 337, 252, 318, 245, 174, 168, 480, 122, 133, 136, 91, 75, 76, 74, 93, 146, 18, 1, 10, 98, 40, 0],
				[67217, 1350, 1225, 1018, 1272, 990, 576, 758, 935, 538, 631, 414, 296, 338, 252, 318, 245, 174, 168, 480, 125, 133, 136, 91, 75, 76, 74, 93, 146, 18, 1, 10, 100, 41, 0],
				[67332, 1350, 1225, 1018, 1272, 990, 576, 758, 935, 538, 631, 417, 296, 338, 252, 318, 245, 174, 168, 480, 125, 133, 136, 91, 75, 76, 75, 93, 146, 18, 1, 10, 100, 42, 0],
				[67466, 1350, 1227, 1018, 1272, 990, 576, 758, 935, 539, 631, 418, 296, 338, 252, 318, 245, 174, 168, 481, 125, 133, 136, 91, 75, 76, 75, 93, 146, 18, 1, 10, 104, 42, 0],
				[67592, 1351, 1227, 1018, 1272, 990, 576, 758, 935, 539, 631, 422, 296, 339, 252, 318, 245, 174, 168, 481, 125, 133, 136, 102, 75, 76, 75, 93, 146, 18, 1, 10, 104, 44, 0],
				[67666, 1352, 1227, 1018, 1272, 990, 576, 758, 935, 539, 631, 426, 296, 342, 252, 318, 245, 174, 168, 481, 125, 133, 136, 119, 75, 76, 75, 93, 146, 18, 1, 10, 107, 45, 0],
				[67707, 1352, 1227, 1018, 1272, 990, 576, 758, 935, 539, 631, 428, 296, 342, 252, 318, 245, 174, 168, 481, 125, 133, 136, 120, 75, 76, 75, 93, 146, 18, 1, 10, 109, 45, 0],
				[67743, 1352, 1227, 1018, 1272, 990, 576, 758, 935, 539, 631, 428, 296, 342, 252, 318, 245, 174, 168, 481, 125, 133, 136, 124, 75, 76, 75, 93, 146, 18, 1, 10, 114, 45, 0],
				[67760, 1353, 1227, 1018, 1272, 990, 576, 758, 935, 539, 631, 429, 296, 342, 252, 318, 245, 174, 168, 481, 125, 133, 136, 124, 75, 76, 75, 93, 146, 18, 1, 10, 115, 45, 0],
				[67773, 1353, 1227, 1018, 1272, 990, 576, 759, 935, 539, 631, 435, 296, 344, 252, 318, 245, 174, 168, 482, 125, 133, 136, 125, 75, 76, 75, 93, 146, 18, 1, 10, 120, 47, 0],
				[67781, 1356, 1227, 1018, 1273, 990, 576, 760, 935, 539, 631, 435, 296, 344, 252, 318, 245, 174, 168, 482, 125, 133, 136, 127, 75, 76, 75, 93, 146, 18, 1, 10, 129, 48, 0],
				[67786, 1356, 1227, 1018, 1273, 990, 576, 760, 935, 539, 631, 436, 296, 346, 252, 318, 245, 174, 168, 482, 125, 133, 136, 127, 75, 76, 75, 93, 146, 18, 1, 10, 131, 49, 0],
				[67790, 1356, 1227, 1018, 1273, 990, 576, 760, 935, 539, 631, 437, 296, 350, 252, 318, 245, 174, 168, 482, 125, 133, 136, 129, 75, 76, 75, 93, 146, 18, 1, 10, 137, 50, 0],

				[67794, 1357, 1231, 1018, 1273, 990, 576, 760, 935, 539, 631, 442, 296, 353, 252, 318, 245, 174, 168, 482, 125, 133, 136, 132, 75, 76, 75, 93, 146, 18, 1, 10, 141, 53, 0],
				[67798, 1361, 1231, 1018, 1273, 990, 576, 760, 935, 539, 631, 446, 296, 355, 252, 318, 245, 175, 168, 482, 125, 133, 136, 133, 75, 76, 75, 93, 146, 18, 1, 10, 148, 59, 0],
				[67799, 1364, 1232, 1018, 1273, 990, 576, 761, 935, 539, 631, 455, 296, 358, 253, 318, 246, 176, 168, 482, 125, 133, 136, 133, 75, 76, 75, 93, 146, 18, 1, 11, 157, 67, 0],
				[67800, 1369, 1232, 1018, 1273, 990, 576, 761, 935, 540, 631, 458, 296, 361, 253, 318, 246, 176, 168, 482, 125, 133, 136, 133, 75, 76, 75, 93, 146, 18, 1, 13, 167, 77, 0],
				[67800, 1378, 1233, 1018, 1273, 990, 576, 761, 935, 540, 631, 479, 296, 363, 253, 318, 246, 176, 168, 483, 125, 133, 136, 133, 75, 76, 75, 93, 146, 18, 1, 15, 192, 100, 0],
				[67800, 1392, 1234, 1018, 1273, 990, 576, 762, 935, 541, 631, 485, 299, 371, 254, 318, 247, 176, 168, 484, 126, 133, 137, 134, 75, 76, 75, 93, 146, 18, 1, 17, 208, 108, 0],
				[67800, 1399, 1236, 1018, 1273, 990, 576, 764, 935, 542, 631, 499, 303, 380, 254, 318, 248, 176, 168, 484, 126, 133, 137, 134, 75, 76, 75, 93, 146, 18, 1, 17, 256, 135, 0],
				[67800, 1407, 1237, 1018, 1273, 990, 576, 765, 936, 543, 633, 512, 307, 394, 254, 319, 248, 176, 168, 484, 126, 133, 137, 134, 75, 76, 75, 93, 146, 18, 1, 18, 273, 153, 0],
				[67800, 1413, 1238, 1018, 1274, 990, 577, 767, 936, 543, 633, 522, 313, 404, 254, 319, 248, 176, 168, 484, 127, 133, 137, 136, 75, 76, 75, 93, 146, 18, 1, 21, 317, 169, 0],
				[67801, 1428, 1240, 1018, 1274, 990, 578, 768, 936, 545, 636, 554, 318, 414, 254, 319, 249, 176, 168, 484, 127, 134, 141, 136, 75, 76, 75, 93, 146, 18, 1, 25, 356, 195, 0],
				[67801, 1433, 1241, 1018, 1274, 990, 578, 769, 936, 547, 638, 559, 322, 433, 254, 319, 250, 176, 168, 484, 127, 134, 145, 136, 77, 76, 75, 94, 146, 18, 1, 26, 386, 216, 0],
				[67801, 1444, 1243, 1018, 1275, 990, 578, 769, 936, 547, 640, 565, 328, 451, 254, 319, 253, 178, 168, 484, 127, 135, 147, 136, 89, 76, 75, 95, 146, 18, 1, 30, 410, 235, 0],
				[67801, 1456, 1247, 1018, 1275, 990, 578, 771, 936, 548, 641, 569, 331, 468, 254, 319, 253, 180, 168, 484, 128, 135, 152, 136, 92, 76, 75, 95, 146, 18, 1, 33, 453, 252, 0],
				[67801, 1467, 1251, 1018, 1275, 990, 578, 772, 936, 548, 641, 572, 337, 485, 254, 319, 253, 180, 168, 484, 131, 135, 156, 136, 94, 76, 75, 97, 146, 18, 1, 34, 518, 267, 0],
				[67801, 1475, 1254, 1018, 1276, 990, 579, 772, 937, 550, 644, 576, 338, 492, 254, 319, 253, 180, 168, 484, 134, 136, 163, 136, 95, 76, 75, 98, 147, 18, 1, 37, 582, 283, 0],
				[67801, 1484, 1255, 1018, 1276, 990, 579, 773, 937, 550, 645, 577, 340, 498, 254, 321, 253, 180, 168, 484, 136, 136, 166, 138, 97, 76, 75, 98, 147, 18, 1, 38, 641, 298, 0],
				[67801, 1490, 1257, 1018, 1276, 990, 579, 774, 937, 550, 646, 580, 343, 509, 254, 321, 253, 181, 168, 484, 139, 136, 174, 138, 107, 76, 75, 98, 147, 18, 1, 39, 682, 306, 0],
				[67801, 1490, 1257, 1018, 1276, 990, 579, 774, 937, 550, 646, 580, 343, 509, 254, 321, 253, 181, 168, 484, 139, 136, 174, 138, 107, 76, 75, 98, 147, 18, 1, 39, 682, 306, 0],
				[67802, 1507, 1258, 1019, 1276, 990, 579, 775, 937, 554, 647, 582, 345, 522, 254, 325, 255, 183, 168, 488, 140, 137, 176, 138, 117, 76, 75, 98, 147, 18, 1, 41, 765, 329, 0],
				[67802, 1508, 1258, 1019, 1276, 990, 579, 775, 937, 554, 647, 582, 345, 522, 254, 325, 255, 183, 168, 488, 140, 137, 177, 138, 117, 76, 75, 98, 147, 18, 1, 41, 802, 339, 0]
			];

			option = {
				baseOption: {

					timeline: {
						axisType: 'category',
						// realtime: false,
						// loop: false,
						autoPlay: true,
						playInterval: 2000,
						symbolSize: 12,
						left: '5%',
						right: '5%',
						bottom: '0%',
						width: '90%',
						// controlStyle: {
						//     position: 'left'
						// },
						data: days,
						tooltip: {
							formatter: days
						},
					},

					tooltip: {
						show: true,
						formatter: function (params) {
							return params.name + '：' + params.data['value']
						},
					},
					visualMap: {
						type: 'piecewise',
						pieces: [{
							min: 1002,
							color: '#73240D'
						},
						{
							min: 501,
							max: 1001,
							color: '#BB0000'
						},
						{
							min: 251,
							max: 500,
							color: '#BD430A'
						},
						{
							min: 101,
							max: 250,
							color: '#E08150'
						},
						{
							min: 11,
							max: 100,
							color: '#E9B090'
						},
						{
							min: 1,
							max: 10,
							color: '#F2DDD2'
						},
						{
							value: 0,
							color: 'white'
						}
						],
						orient: 'vertical',
						itemWidth: 25,
						itemHeight: 15,
						showLabel: true,
						seriesIndex: [0],

						textStyle: {
							color: '#7B93A7'
						},
						bottom: '10%',
						left: "5%",
					},
					grid: {
						right: '5%',
						top: '20%',
						bottom: '10%',
						width: '20%'
					},
					xAxis: {
						min: 0,
						max: 4000,
						show: false
					},
					yAxis: [{
						inverse: true,
						offset: '2',
						'type': 'category',
						data: '',
						nameTextStyle: {
							color: '#fff'
						},
						axisTick: {
							show: false,
						},
						axisLabel: {
							//rotate:45,
							textStyle: {
								fontSize: 14,
								color: '#000000',
							},
							interval: 0
						},
						axisLine: {
							show: false,
							lineStyle: {
								color: '#333'
							},
						},
						splitLine: {
							show: false,
							lineStyle: {
								color: '#333'
							}
						},
					}],
					geo: {
						map: 'china',
						right: '35%',
						left: '5%',
						label: {
							emphasis: {
								show: false,
							}
						},
						itemStyle: {
							emphasis: {
								areaColor: '#00FF00'
							}
						}
					},
					series: [{
						name: 'mapSer',
						type: 'map',
						map: 'china',
						roam: false,
						geoIndex: 0,
						label: {
							show: false,
						},
					},
					{
						'name': '',
						'type': 'bar',
						zlevel: 2,
						barWidth: '40%',
						label: {
							normal: {
								show: true,
								fontSize: 14,
								position: 'right',
								formatter: '{c}'
							}
						},
					}
					],

				},
				animationDurationUpdate: 3000,
				animationEasingUpdate: 'quinticInOut',
				options: []
			};
			for (var n = 0; n < days.length; n++) {

				var res = [];
				for (var j = 0; j < data[n].length; j++) {
					res.push({
						name: province[j],
						value: data[n][j]
					});
				}
				res.sort(function (a, b) {
					return b.value - a.value;
				}).slice(0, 6);

				res.sort(function (a, b) {
					return a.value - b.value;
				});
				var res1 = [];
				var res2 = [];
				for (var t = 0; t < 10; t++) {
					res1[t] = res[res.length - 1 - t].name;
					res2[t] = res[res.length - 1 - t].value;
				}
				option.options.push({
					title: [{
						text: days[n] + "日  ",
						textStyle: {
							color: '#2D3E53',
							fontSize: 28
						},
						left: 20,
						top: 20,
					},
					{
						show: true,
						text: '感染人数前十的省份',
						textStyle: {
							color: '#2D3E53',
							fontSize: 18
						},
						right: '10%',
						top: '15%'
					}
					],
					yAxis: {
						data: res1,
					},
					series: [{
						type: 'map',
						data: res
					}, {
						type: 'bar',
						data: res2,
						itemStyle: {
							normal: {
								color: function (params) {
									// build a color map as your need.
									var colorList = [{
										colorStops: [{
											offset: 0,
											color: '#FF0000' // 0% 处的颜色
										}, {
											offset: 1,
											color: '#990000' // 100% 处的颜色
										}]
									},
									{
										colorStops: [{
											offset: 0,
											color: '#00C0FA' // 0% 处的颜色
										}, {
											offset: 1,
											color: '#2F95FA' // 100% 处的颜色
										}]
									}
									];
									if (params.dataIndex < 3) {
										return colorList[0]
									} else {
										return colorList[1]
									}
								},
							}
						},
					}]
				});
			}
			myChart1.setOption(option);
			this.setState({
				myChart: myChart1
			})
		}
	};

	componentDidMount = () => {
		let _this = this;
		_this.show();

		if (window.attachEvent) {//判断是不是IE
			window.onresize = function () {
				_this.state.myChart.resize();
			}
			// window.attachEvent("onresize",_this.iegbck() );
		} else if (window.addEventListener) {//如果非IE执行以下方法
			window.addEventListener("resize", () => {
				console.log('正在改变chrome')
				_this.state.myChart.resize();
			});
		}
		// axios.post("http://localhost:8003/test/world","test").then((req,res)=>{
		// 	console.log(req.data)
		// })
	};

	render() {
		return (
			<div id="main" style={{ width: "100%", height: "100vh", position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)" }}></div>
		)

	}
}
export default DateView;
