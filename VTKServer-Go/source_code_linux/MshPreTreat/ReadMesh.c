// write by zhanglicheng at 20191216
#include "FROF.h"
#define strnicmp strncasecmp
void ReadMesh(const char *FileName, Coor* Coor0, Mesh* Mesh0) {

    Coor0->nodeN  = 0;
    Mesh0->TypeN  = 0;
    Mesh0->Scale  = (int*)malloc(10*sizeof(int));
    Mesh0->EnodeN = (int*)malloc(10*sizeof(int));
    Mesh0->Type   = (EType*)malloc(10*sizeof(EType));
    
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

        if (strnicmp(temp_str1,"Mesh" ,4) == 0) {

            int count = 0;
            for (int i = 0; temp_str[i] != '\0'; i++)
                if (temp_str[i] == ' ')
                    count++;
            
            if (count == 7)
                sscanf(temp_str1, "%s %s %s %d %s %s %s %d", 
                temp_str2, temp_str2, temp_str2, &(Coor0->dim), 
                temp_str2, elem_type, temp_str2, &(Mesh0->EnodeN[Mesh0->TypeN]));
            else if (count == 6)
                sscanf(temp_str1, "%s %s %d %s %s %s %d", 
                temp_str2, temp_str2, &(Coor0->dim), temp_str2, 
                elem_type, temp_str2, &(Mesh0->EnodeN[Mesh0->TypeN]));
            else {
                printf("Not identifiable Form, need to improve! -- '%s'\n", temp_str1);
                return;
            }

            switch(Mesh0->EnodeN[Mesh0->TypeN]) {
                case  1: Mesh0->Type[Mesh0->TypeN] = P1; break;
                case  2: Mesh0->Type[Mesh0->TypeN] = L2; break;
                case  3: 
                    if      (strncmp(elem_type, "Triangle", 4) == 0) Mesh0->Type[Mesh0->TypeN] = T3;
                    else if (strncmp(elem_type, "Line",     4) == 0) Mesh0->Type[Mesh0->TypeN] = L3;
                    break;
                case  4:
                    if      (strncmp(elem_type, "Quadrilateral", 4) == 0) Mesh0->Type[Mesh0->TypeN] = Q4;
                    else if (strncmp(elem_type, "Tetrahedra",    4) == 0) Mesh0->Type[Mesh0->TypeN] = W4;
                    break;
                case  5: Mesh0->Type[Mesh0->TypeN] = P5; break;
                case  6:
                    if      (strncmp(elem_type, "Triangle", 4) == 0) Mesh0->Type[Mesh0->TypeN] = T6;
                    else if (strncmp(elem_type, "Prism",    4) == 0) Mesh0->Type[Mesh0->TypeN] = W6;
                    break;
                case  8:
                    if      (strncmp(elem_type, "Quadrilateral", 4) == 0) Mesh0->Type[Mesh0->TypeN] = Q8;
                    else if (strncmp(elem_type, "Hexahedra",     4) == 0) Mesh0->Type[Mesh0->TypeN] = C8;
                    break;
                case  9: Mesh0->Type[Mesh0->TypeN] = Q9;  break;
                case 10: Mesh0->Type[Mesh0->TypeN] = W10; break;
                case 13: Mesh0->Type[Mesh0->TypeN] = P13; break;
                case 14: Mesh0->Type[Mesh0->TypeN] = P14; break;
                case 15: Mesh0->Type[Mesh0->TypeN] = W15; break;
                case 18: Mesh0->Type[Mesh0->TypeN] = W18; break;
                case 20: Mesh0->Type[Mesh0->TypeN] = C20; break;
                case 27: Mesh0->Type[Mesh0->TypeN] = C27; break;
            }

            Mesh0->TypeN ++;

            continue;
        }

        else if (strnicmp(temp_str1,"Coor", 4) == 0 && Mesh0->TypeN == 1) {
            line_count = 0;
            continue;
        }

        else if (strnicmp(temp_str1,"End coor", 8) == 0 && Mesh0->TypeN == 1) {
            Coor0->nodeN = line_count - 1;
            continue;
        }

        else if (strnicmp(temp_str1,"Elem", 4) == 0) {
            line_count = 0;
            continue;
        }

        else if (strnicmp(temp_str1,"End elem", 8) == 0) {
            Mesh0->Scale[Mesh0->TypeN-1] = line_count - 1;
            continue;
        }
    }

    rewind(fp);
    //printf("%d %d %d %d\n",Coor0->nodeN, Mesh0->Scale[0], Mesh0->EnodeN[0] ,Mesh0->TypeN);

    int  temp_int = 0;

    Mesh0->elem = (Elem**)malloc(Mesh0->TypeN * sizeof(Elem*));
    for (int i = 0; i < Mesh0->TypeN; i++) {
        Mesh0->elem[i] = (Elem*)malloc(Mesh0->Scale[i] * sizeof(Elem));
        for (int j = 0; j < Mesh0->Scale[i]; j++)
            Mesh0->elem[i][j].node = (int*)malloc(Mesh0->EnodeN[i] * sizeof(int));
    }

    Coor0->Coor = (double*)malloc(Coor0->dim * Coor0->nodeN * sizeof(double));

    for (int i=0; i<Mesh0->TypeN; i++) {

        while( fgets(temp_str, 255, fp) != NULL ) {

            for (int i = 0; ;i++) {
                if (temp_str[i] != ' ') {
                    temp_str1 = &(temp_str[i]);
                    break;
                }
            }
            if (strnicmp(temp_str1,"Coordinates" ,4) == 0)
            break;
        }

        if (i==0) {

            for (int nod_i=0; nod_i<Coor0->nodeN; nod_i++) {

                fscanf (fp, "%d", &temp_int);
                
                for (int dim_i=0; dim_i<Coor0->dim; dim_i++) {

                    fscanf (fp, "%lf", &(Coor0->Coor[nod_i*Coor0->dim + dim_i]));
                }
            }
        }

        while( fgets(temp_str, 255, fp) != NULL ) {
            for (int i = 0; ;i++) {
                if (temp_str[i] != ' ') {
                    temp_str1 = &(temp_str[i]);
                    break;
                }
            }
            if (strnicmp(temp_str1,"Elements" ,4) == 0)
            break;
        }

        fpos_t pos;
        fgetpos(fp, &pos);
        fgets(temp_str, 255, fp);

        int count = 0;
        for (int i = 0; temp_str[i] != '\0'; i++)
            if (temp_str[i] == ' ')
                count++;

        fsetpos(fp,&pos);

        for (int elem_i=0; elem_i<Mesh0->Scale[i]; elem_i++) {

            fscanf (fp, "%d", &temp_int);

            for (int nod_i=0; nod_i<Mesh0->EnodeN[i]; nod_i++) {

                fscanf (fp, "%d", &(Mesh0->elem[i][elem_i].node[nod_i]));
            }

            if (count == Mesh0->EnodeN[i])
                Mesh0->elem[i][elem_i].Tag = 1;
            else
                fscanf (fp, "%d",&(Mesh0->elem[i][elem_i].Tag));
        }

    }

    fclose(fp);
}