// write by zhanglicheng at 20191212
#include "FROF.h"
#include <limits.h>


// to be improved when new element type is needed to be converted.
int faceC8[6][4] = {{4,7,6,5},
                    {0,3,7,4},
                    {0,1,2,3},
                    {1,5,6,2},
                    {0,4,5,1},
                    {2,6,7,3}};

int faceW4[4][3] = {{3,2,1},
                    {0,2,3},
                    {2,0,1},
                    {1,0,3}};

int faceH6[5][4] = {{2,1,0,INT_MAX},
                    {5,4,3,INT_MAX},
                    {2,5,4,1},
                    {2,0,3,5},
                    {1,4,3,0}};
// to be improved when new element type is needed to be converted.

// input: [2,3,1,7,9] --> output: 2
int FindMinIndex(const int *array, const int size) {
    int min = INT_MAX;
    int min_index = 0;
    for (int i=0; i<size; i++) {
        if (min > array[i]) {
            min = array[i];
            min_index = i ;
        }
    }
    return min_index;
}

// input: array:[2,3,1,7,9] --> output: array:[1,7,9,2,3]
void CircleSort(int *array, const int size, const int min_index) {
//void CircleSort(int *array, int *temp_array, const int size, const int min_index) {
    int temp_array[min_index];
    memmove(temp_array, array, min_index*sizeof(int));
    memmove(array, array + min_index, (size - min_index)*sizeof(int));
    memmove(array + (size - min_index), temp_array, min_index*sizeof(int));
}

void SaveFace(Face *face0, const int *array, const int size) {
    face0->FnodeN = size;
    face0->node = (int*)malloc(size*sizeof(int));
    memcpy(face0->node, array, size*sizeof(int));
}

void CopyFace(Face *face_dest, Face *face_src) {
    face_dest->FnodeN = face_src->FnodeN;
    face_dest->node = (int*)malloc(face_dest->FnodeN*sizeof(int));
    memcpy(face_dest->node,face_src->node,face_dest->FnodeN*sizeof(int));
}

int FaceCompare(Face face1, Face face2) {

    if (face1.FnodeN != face2.FnodeN) 
        return 0;
    else {
        if (face1.node[0] != face2.node[0])
            return 0;
        else {
            int size = face1.FnodeN;
            for (int i=1; i<size; i++) {
                if (face1.node[i] != face2.node[i]
                &&  face1.node[i] != face2.node[size-i])
                    return 0;
            }
        }
    }
    return 1;
}

int JudgeFaceIN(Face* Farray, Face face0, int Fcount) {

    for (int i = 0; i < Fcount; i++) {

        if ( FaceCompare (Farray[i], face0) == 1)

            return i;
    }

    return -1;
}

void FindFace(Mesh Mesh0, Face ***FList, int **Fcount, int ***F_out, int **face_node, int nodeN) {

    int pre_nodeN = 0;
    int maxnodeN = 0;
    int faceN = 0;
    int facetype = 0;
    int faceNodeN[max_faceN];
    int **local_face_topo;
    int  *      face_topo;

    (*FList)  = (Face**)malloc(nodeN*sizeof(Face*));
    (*Fcount) = (int*  )calloc(nodeN,sizeof(int));
    (*F_out)  = (int** )malloc(nodeN*sizeof(int*));
    for (int i=0; i<nodeN; i++) {
        (*FList)[i] = (Face*)malloc(init_size*sizeof(Face));
        (*F_out)[i] = (int* )malloc(init_size*sizeof(int));
    }

    (*face_node) = (int*)calloc(max_faceType,sizeof(int));

    for (int type_i=0; type_i<Mesh0.Type; type_i++) {

        switch (Mesh0.EnodeN[type_i]) {
            case 4:
                faceNodeN[0] = 3; faceNodeN[1] = 3;
                faceNodeN[2] = 3; faceNodeN[3] = 3;
                maxnodeN = 3;
                faceN = 4;
                local_face_topo = (int**)malloc(faceN*sizeof(int*));
                for (int i=0; i<faceN; i++)
                    local_face_topo[i] = faceW4[i];
                break;
            case 8:
                faceNodeN[0] = 4; faceNodeN[1] = 4; faceNodeN[2] = 4;
                faceNodeN[3] = 4; faceNodeN[4] = 4; faceNodeN[5] = 4;
                maxnodeN = 4;
                faceN = 6;
                local_face_topo = (int**)malloc(faceN*sizeof(int*));
                for (int i=0; i<faceN; i++)
                    local_face_topo[i] = faceC8[i];
                break;
            case 6:
                faceNodeN[0] = 3; faceNodeN[1] = 3; faceNodeN[2] = 4;
                faceNodeN[3] = 4; faceNodeN[4] = 4;
                maxnodeN = 4;
                faceN = 5;
                local_face_topo = (int**)malloc(faceN*sizeof(int*));
                for (int i=0; i<faceN; i++)
                    local_face_topo[i] = faceH6[i];
                break;
            // to be improved when new element type is needed to be converted.
        }

        //(*face_node)[type_i] = faceNodeN;

        for (int i = 0; i <faceN; i++) {

            int find_tag0 = 0;

            for (int j = 0; j <facetype ; j++) {

                if (faceNodeN[i] == (*face_node)[j]) {

                    find_tag0 = 1;

                    break;
                }
            }

            if (find_tag0 == 0) {
                (*face_node)[facetype++] = faceNodeN[i];
            }
        }

        face_topo = (int* )malloc(maxnodeN*sizeof(int));

        for (int elem_i=0; elem_i<Mesh0.Scale[type_i]; elem_i++) {

            int *node = Mesh0.Mesh + (pre_nodeN + elem_i*(Mesh0.EnodeN[type_i] + 1));

            for (int face_i=0; face_i<faceN; face_i++) {

                for (int node_i=0; node_i<faceNodeN[face_i]; node_i++)
                    face_topo[node_i] = node[local_face_topo[face_i][node_i]];

                int min_index = FindMinIndex(face_topo, faceNodeN[face_i]);

                CircleSort(face_topo, faceNodeN[face_i], min_index);

                Face temp_face;

                SaveFace(&temp_face, face_topo, faceNodeN[face_i]);

                int find_tag = JudgeFaceIN((*FList)[ face_topo[0]-1 ], temp_face, (*Fcount)[ face_topo[0]-1 ]);

                if ( find_tag == -1) {

                    if ((*Fcount)[ face_topo[0]-1 ] % init_size == 0) {

                        (*FList) [ face_topo[0]-1 ] = realloc ((*FList) [ face_topo[0]-1 ], 
                       ((*Fcount)[ face_topo[0]-1 ]/init_size + 1) * init_size * sizeof (Face));

                        (*F_out) [ face_topo[0]-1 ] = realloc ((*F_out) [ face_topo[0]-1 ], 
                       ((*Fcount)[ face_topo[0]-1 ]/init_size + 1) * init_size * sizeof (int));

                    }

                    (*F_out) [ face_topo[0]-1 ][ (*Fcount)[ face_topo[0]-1 ] ] = 1;

                    (*FList) [ face_topo[0]-1 ][ (*Fcount)[ face_topo[0]-1 ] ].Tag = node[Mesh0.EnodeN[type_i]];

                    CopyFace ( &( (*FList)[ face_topo[0]-1 ][ (*Fcount)[ face_topo[0]-1 ] ++ ] ), &temp_face );

                }
                else
                    (*F_out) [ face_topo[0]-1 ][ find_tag ] ++;
            }
        }

        pre_nodeN += (Mesh0.EnodeN[type_i] + 1)*Mesh0.Scale[type_i];

        free(local_face_topo);
        free(      face_topo);
    }
}