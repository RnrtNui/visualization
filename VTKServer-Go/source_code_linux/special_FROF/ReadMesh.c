// write by zhanglicheng at 20191212
#include "FROF.h"
void ReadMesh(const char *FileName, Coor* Coor0, Mesh* Mesh0) {

    Coor0->nodeN  = 0;
    Mesh0->Type   = 0;
    Mesh0->Scale  = (int*)malloc(10*sizeof(int));
    Mesh0->EnodeN = (int*)malloc(10*sizeof(int));
    
    FILE *fp;
    fp = fopen(FileName, "r");
    //if ( ( fp = fopen(FileName, "r") ) == NULL ); {
    //    printf("Cannot open '%s'\n", FileName);
    //    exit(1);
    //}

    char temp_str[255];
    char *temp_str1;
    char temp_str2[48];
    char elem_type[48];
    int  line_count = 0;

    while(fgets(temp_str, 255, fp) != NULL) {

        line_count ++;

        for (int i = 0; ;i++) {
            if (temp_str[i] != ' ') {
                temp_str1 = &(temp_str[i]);
                break;
            }
        }

        if (strncmp(temp_str1,"Mesh" ,4) == 0) {
            
            sscanf(temp_str1, "%s %s %s %d %s %s %s %d", 
            temp_str2, temp_str2, temp_str2, &(Coor0->dim), 
            temp_str2, elem_type, temp_str2, &(Mesh0->EnodeN[Mesh0->Type]));
			
			if (Mesh0->EnodeN[Mesh0->Type] == 8)
				Mesh0->EnodeN[Mesh0->Type] = 6;

            if (strncmp(elem_type,"Triangle" ,4) == 0
              ||strncmp(elem_type,"Quadrilateral" ,4) == 0
              ||strncmp(elem_type,"Line" ,4) == 0)
               break;

            Mesh0->Type ++;

            continue;
        }

        else if (strncmp(temp_str1,"Coor", 4) == 0 && Mesh0->Type == 1) {
            line_count = 0;
            continue;
        }

        else if (strncmp(temp_str1,"End coor", 8) == 0 && Mesh0->Type == 1) {
            Coor0->nodeN = line_count - 1;
            continue;
        }

        else if (strncmp(temp_str1,"Elem", 4) == 0) {
            line_count = 0;
            continue;
        }

        else if (strncmp(temp_str1,"End elem", 8) == 0) {
            Mesh0->Scale[Mesh0->Type-1] = line_count - 1;
            continue;
        }
    }

    rewind(fp);

    int  temp_int = 0;

    int total_nodeN = 0;
    for (int i = 0; i <Mesh0->Type; i++)
        total_nodeN += Mesh0->Scale[i]*(Mesh0->EnodeN[i] + 1);

    Mesh0->Mesh = (int   *)malloc(total_nodeN * sizeof(int));
    
    Coor0->Coor = (double*)malloc(Coor0->dim * Coor0->nodeN * sizeof(double));
    
    total_nodeN = 0;
	
	int ElemNodN = 0;

    for (int i=0; i<Mesh0->Type; i++) {

        fgets(temp_str, 255, fp); // Mesh "**" Dimension * Elemtype ** Nnode *

        fgets(temp_str, 255, fp); // Coordinates

        if (i==0) {

            for (int nod_i=0; nod_i<Coor0->nodeN; nod_i++) {

                fscanf (fp, "%d", &temp_int);
                
                for (int dim_i=0; dim_i<Coor0->dim; dim_i++) {

                    fscanf (fp, "%lf", &(Coor0->Coor[nod_i*Coor0->dim + dim_i]));
                }
            }
        }

        fgets(temp_str, 255, fp); // End coordinates

        fgets(temp_str, 255, fp); // Elements
        fgets(temp_str, 255, fp);
		
		ElemNodN = Mesh0->EnodeN[i];
		
		if (ElemNodN == 6);
			ElemNodN = 8;

        for (int elem_i=0; elem_i<Mesh0->Scale[i]; elem_i++) {

            fscanf (fp, "%d", &temp_int);

			int nod_j = 0;
            for (int nod_i=0; nod_i<ElemNodN + 1; nod_i++) {
				
				if (nod_i == 2 || nod_i == 6)
					fscanf (fp, "%d", &temp_int);
					
				else
					fscanf (fp, "%d", &(Mesh0->Mesh[total_nodeN + elem_i*(Mesh0->EnodeN[i]+1) + (nod_j++)]));
            }
        }

        fgets(temp_str, 255, fp); // End elements

        total_nodeN += Mesh0->Scale[i]*(ElemNodN+1);
    }

    fclose(fp);
}