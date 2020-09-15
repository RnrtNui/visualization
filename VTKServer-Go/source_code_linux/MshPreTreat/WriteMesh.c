// write by zhanglicheng at 20191216
#include "FROF.h"
#include "string.h"
void WriteMesh(const char *FileName, Coor Coor0, Mesh Mesh0) {

    char FFileName[255];
	char buf[100];
	int len=strlen(FileName);
	int flag;
	for (int i = 0 ; i <= len-1; i++)
	{
		if (FileName[i] == '\\'|| FileName[i] == '/')
		{
			flag = i;
		}
	}
	strncpy(FFileName, FileName, flag + 1);
	FFileName[flag+1] = 'T';
	for (int i = flag+1; i < len; i++)
	{
		FFileName[i + 1] = FileName[i];
	}
	FFileName[len + 1] = '\0';

    FILE *fp;
    fp = fopen(FFileName, "wb");

    fprintf(fp,"%d %d\n", Coor0.dim, Coor0.nodeN);
    for (int i=0; i<Coor0.nodeN; i++) {
        for (int j=0; j<Coor0.dim; j++) {
            fprintf(fp, "%e", Coor0.Coor[i*Coor0.dim+j]);
            if (j == Coor0.dim - 1)
                fprintf(fp, "\n");
            else
                fprintf(fp, " ");
        }
    }

    fprintf(fp, "%d\n", Mesh0.TypeN);
    for (int type_i=0; type_i<Mesh0.TypeN; type_i++) {

        fprintf(fp, "%d %d ",Mesh0.EnodeN[type_i], Mesh0.Scale[type_i]);

        switch(Mesh0.Type[type_i]) {
            case P1:  fprintf(fp,"%s %s\n", "P1",  "Point"); break;
            case L2:  fprintf(fp,"%s %s\n", "L2",  "Line"); break;
            case L3:  fprintf(fp,"%s %s\n", "L3",  "Line"); break;
            case T3:  fprintf(fp,"%s %s\n", "T3",  "Triangle"); break;
            case T6:  fprintf(fp,"%s %s\n", "T6",  "Triangle"); break;
            case Q4:  fprintf(fp,"%s %s\n", "Q4",  "Quadrilateral"); break;
            case Q8:  fprintf(fp,"%s %s\n", "Q8",  "Quadrilateral"); break;
            case Q9:  fprintf(fp,"%s %s\n", "Q9",  "Quadrilateral"); break;
            case W4:  fprintf(fp,"%s %s\n", "W4",  "Tetrahedra"); break;
            case W10: fprintf(fp,"%s %s\n", "W10", "Tetrahedra"); break;
            case C8:  fprintf(fp,"%s %s\n", "C8",  "Hexahedra"); break;
            case C20: fprintf(fp,"%s %s\n", "C20", "Hexahedra"); break;
            case C27: fprintf(fp,"%s %s\n", "C27", "Hexahedra"); break;
            case P5:  fprintf(fp,"%s %s\n", "P5",  "pyramid"); break;
            case P13: fprintf(fp,"%s %s\n", "P13", "pyramid"); break;
            case P14: fprintf(fp,"%s %s\n", "P14", "pyramid"); break;
            case W6:  fprintf(fp,"%s %s\n", "W6",  "Prism"); break;
            case W15: fprintf(fp,"%s %s\n", "W15", "Prism"); break;
            case W18: fprintf(fp,"%s %s\n", "W18", "Prism"); break;
        }

        for (int i=0; i<Mesh0.Scale[type_i]; i++) {

            for (int j=0; j<Mesh0.EnodeN[type_i]; j++) {

                fprintf(fp, "%d ", Mesh0.elem[type_i][i].node[j]);
            }

            fprintf(fp, "%d\n", Mesh0.elem[type_i][i].Tag);
        }
    }

    fclose(fp);
}