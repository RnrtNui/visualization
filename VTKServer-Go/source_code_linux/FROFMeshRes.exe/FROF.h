// write by yufenfen at 20200114
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct {
    double *Coor;
    int dim;
    int nodeN;
}Coor;

typedef struct {
    int Type;
    int *Mesh;
    int *EnodeN;
    int *Scale;
}Mesh;

void WriteOutNodes();

#define init_size 10
#define max_faceN 6
#define max_faceType 6
