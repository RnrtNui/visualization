// write by zhanglicheng at 20191216
#include "FROF.h"
#include <time.h>

int main(int argc, char *argv[]) {

    char* FileName = argv[1];

    int begintime, endtime;

    Coor Coor0;
    Mesh Mesh0;

    begintime=clock();
    ReadMesh(FileName, &Coor0, &Mesh0);
    endtime  =clock();

    printf("Reading Mesh Time:%f\n", (double)(endtime-begintime)/CLOCKS_PER_SEC);

    begintime=clock();
    for (int i=0; i<Mesh0.TypeN; i++) {
        Elem *temp = (Elem*)malloc(Mesh0.Scale[i]*sizeof(Elem));
        MergeSort(Mesh0.elem[i],0,Mesh0.Scale[i]-1,temp);
        free(temp);
    }
    endtime  =clock();
    printf("Sorting Mesh Time:%f\n", (double)(endtime-begintime)/CLOCKS_PER_SEC);
    
    begintime=clock();
    WriteMesh(FileName, Coor0, Mesh0);
    endtime  =clock();

    printf("Writing Mesh Time:%f\n", (double)(endtime-begintime)/CLOCKS_PER_SEC);
}
