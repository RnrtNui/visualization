// write by zhanglicheng at 20191212
#include "FROF.h"

void WriteOutFaces(Face **FList, int *Fcount, int **F_out, int *facenodeN, Coor Coor0, char* FileName) {

    char FFileName[255];
    char buf[100];
    int len=strlen(FileName);
    int flag;
    for (int i =0;i<=len-1;i++)
    {
      if (FileName[i]=='\\'|| FileName[i]=='/')
      {
          flag = i;
      }    
    }
    strncpy(FFileName, FileName, flag + 1);
    FFileName[flag+1] = 'F';
    for (int i = flag+1;i<len;i++)
    {
        FFileName[i+1]=FileName[i];
    }
    FFileName[len + 1] = '\0';
    FILE *fp = fopen(FFileName, "w");

    char meshname[255];
    char elemname[255];

    for (int Type_i=0; ; Type_i++) {

        if ( facenodeN[Type_i] == 0)
            break;

        switch(facenodeN[Type_i]) {
            case 3:
                strcpy(meshname, "aet3g2");
                strcpy(elemname, "Triangle");
                break;
            case 4:
                strcpy(meshname, "aeq4g2");
                strcpy(elemname, "Quadrilateral");
                break;
        }

        fprintf(fp, "Mesh \"%s\" Dimension 3 Elemtype %s Nnode %d\n", meshname, elemname, facenodeN[Type_i]);
        fprintf(fp, "Coordinates\n");
        if (Type_i == 0) {

            for (int i=0; i<Coor0.nodeN; i++) {

                fprintf(fp, "%d", i+1);

                for (int j=0; j<Coor0.dim; j++) {

                    fprintf(fp, " %lf", Coor0.Coor[i*Coor0.dim+j]);

                }

                fprintf(fp, "\n");
            }
        }

        fprintf(fp, "End coordinates\nElements\n");

        int face_i = 0;

        for (int i=0; i<Coor0.nodeN; i++) {

            for (int j=0; j<Fcount[i]; j++) {

                if ((F_out[i][j] == 1) && (FList[i][j].FnodeN == facenodeN[Type_i])) {

                    fprintf(fp, "%d", ++face_i);

                    for (int k=0; k<facenodeN[Type_i]; k++) {

                        fprintf(fp, " %d", FList[i][j].node[k]);

                    }

                    fprintf(fp, " %d\n", FList[i][j].Tag);
                }
            }
        }

        fprintf(fp, "End elements\n");
    }

    fclose(fp);
}