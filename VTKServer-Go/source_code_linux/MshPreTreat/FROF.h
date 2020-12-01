// write by zhanglicheng at 20191216
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef enum {P1=1,   L2,L3,  T3,T6,     Q4,Q8,Q9,       W4,W10,      C8,C20,C27,  P5,P13,P14,  W6,W15,W18} EType;
//            Point,  Line,   Triangle,  Quadrilateral,  Tetrahedra,  Cube,        Pyramid,     Prism
typedef struct {
    double *Coor;
    int dim;
    int nodeN;
}Coor;

typedef struct {
    int *node;
    int Tag;
}Elem;

typedef struct {
    int    TypeN;
    EType *Type;
    Elem **elem;
    int *EnodeN;
    int *Scale;
}Mesh;

void ReadMesh();
void WriteMesh();
void MergeSort();

#define init_size 10
#define max_faceN 6
#define max_faceType 6