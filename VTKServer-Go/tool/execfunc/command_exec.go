package execfunc

import (
	"archive/zip"
	"io"
	"os"
	"os/exec"
	"path/filepath"

	"github.com/astaxie/beego"
)

//RunMsh run msh
func RunMsh(command string, fileName ...string) (string, error) {

	if len(fileName) == 1 {
		out, err := exec.Command(command, fileName[0]).Output()
		beego.Debug("command is :", command)

		return string(out), err
	} else if len(fileName) == 2 {
		out, err := exec.Command(command, fileName[0], fileName[1]).Output()
		beego.Debug("command is :", command)
		beego.Debug("out :", string(out))
		return string(out), err
	}
	return "传入正确的参数", nil
}

//Unzip 压缩文件解压
func Unzip(zipFile string, destDir string) error {
	zipReader, err := zip.OpenReader(zipFile)
	if err != nil {
		return err
	}
	defer zipReader.Close()

	for _, f := range zipReader.File {
		fpath := filepath.Join(destDir, f.Name)
		if f.FileInfo().IsDir() {
			os.MkdirAll(fpath, os.ModePerm)
		} else {
			if err = os.MkdirAll(filepath.Dir(fpath), os.ModePerm); err != nil {
				return err
			}

			inFile, err := f.Open()
			if err != nil {
				return err
			}
			defer inFile.Close()

			outFile, err := os.OpenFile(fpath, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, f.Mode())
			if err != nil {
				return err
			}
			defer outFile.Close()

			_, err = io.Copy(outFile, inFile)
			if err != nil {
				return err
			}
		}
	}
	return nil
}
