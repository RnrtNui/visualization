// write by zhanglicheng at 20191212
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

typedef struct {
    int FnodeN;
    int *node;
    int Tag;
}Face;

void ReadMesh();
void FindFace();
void WriteOutFaces();

#define init_size 10
#define max_faceN 6
#define max_faceType 6