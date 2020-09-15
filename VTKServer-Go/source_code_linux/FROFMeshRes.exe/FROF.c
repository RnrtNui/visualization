// write by yufenfen at 20200114
#include "FROF.h"
#include <time.h>

int main(int argc, char *argv[]) {

    char* FileName = argv[1];
    char* RFileName = argv[2];
    int begintime, endtime;

    Coor Coor0;
    Mesh Mesh0;

  
    WriteOutNodes(&Coor0, &Mesh0, FileName, RFileName);


}
