// write by zhanglicheng at 20191212
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

    //printf("nodeN=%d\nType=%d\nScale[0]=%d\nScale[1]=%d\n", Coor0.nodeN, Mesh0.Type, Mesh0.Scale[0], Mesh0.Scale[1]);
    //printf("dim=%d\nEnodeN[0]=%d\nEnodeN[1]=%d\n", Coor0.dim, Mesh0.EnodeN[0], Mesh0.EnodeN[1]);

    Face **FList;
    int  *Fcount;
    int **F_out;
    int *facenodeN;

    begintime=clock();
    FindFace(Mesh0, &FList, &Fcount, &F_out, &facenodeN, Coor0.nodeN);
    endtime  =clock();

    printf("Find Faces Time:%f\n", (double)(endtime-begintime)/CLOCKS_PER_SEC);

    
    /*
    for (int i=0; i<Coor0.nodeN; i++)
    {
        printf("%d, faceN = %d\n",i+1,Fcount[i]);
        for (int j=0; j<Fcount[i]; j++) {
            for (int k=0; k<FList[i][j].FnodeN; k++)
                printf(" %d",FList[i][j].node[k]);

            printf(" :%d\n",F_out[i][j]);
        }
    }*/
    
    WriteOutFaces(FList, Fcount, F_out, facenodeN, Coor0, FileName);
}
