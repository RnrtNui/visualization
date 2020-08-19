package dao

import (
	"github.com/astaxie/beego"
	"github.com/astaxie/beego/orm"
	_ "github.com/go-sql-driver/mysql" //sql driver 引入驱动
)

//Users primary key
type Users struct {
	ID          int64  `orm:"column(id);pk" json:"id"`
	Username    string `orm:"column(username);size(50)" json:"userName"`
	Password    string `orm:"column(password);size(50)" json:"password"`
	Email       string `orm:"column(email);size(50)" json:"email"`
	Mobile      string `orm:"column(mobile);size(13)" json:"mobile"`
	Avatar      string `orm:"column(avatar);size(100)" json:"avatar"`
	NickName    string `orm:"column(nickname);size(50)" json:"nickname"`
	Description string `orm:"column(description);size(100)" json:"description"`
	Address     string `orm:"column(address);size(100)" json:"address"`
	Status      int    `orm:"column(status)" json:"status"`
	Area        string `orm:"column(area);size(100)" json:"area"`
	Permission  int    `orm:"column(permission)" json:"permission"`
}

//Projects  项目
type Projects struct {
	ID      int64  `orm:"column(id);pk" json:"id"`
	Proname string `orm:"column(proname);size(100)" json:"-"`
	Prodesc string `orm:"column(prodesc);size(500)" json:"-"`
	Proicon string `orm:"column(proicon);size(100)" json:"-"`
}

//Files  项目文件
type Files struct {
	ID       int64  `orm:"column(id);pk" json:"id"`
	Proname  string `orm:"column(proname);size(100)" json:"-"`
	FileName string `orm:"column(filename));size(100)" json:"-"`
}

//连接数据库
func init() {
	dsn := beego.AppConfig.String("MysqlConnect")
	//注册数据库mysql
	orm.RegisterDriver("mysql", orm.DRMySQL)

	orm.RegisterDataBase("default", "mysql", dsn)

	//注册表前缀
	orm.RegisterModelWithPrefix("vtk_", new(Users), new(Projects))

}

//UserAdd 数据表注册
func UserAdd(this *Users) (int64, error) {
	o := orm.NewOrm()
	id, err := o.Insert(this)
	return id, err
}

//UserFind 注意：密码采用md5生成十六进制转换后的字符进行存储
func UserFind(userName string) (*Users, error) {
	o := orm.NewOrm()

	Users := new(Users)
	//返回queryseter
	qs := o.QueryTable(Users)

	err := qs.Filter("username", userName).One(Users, "Password", "Email", "Mobile", "Avatar", "Nickname", "Description", "Address", "Status", "area")
	if err != nil {
		return nil, err
	}
	return Users, nil

}

//ProAdd 项目添加
func ProAdd(this *Projects) (int64, error) {
	o := orm.NewOrm()
	id, err := o.Insert(this)
	return id, err
}
