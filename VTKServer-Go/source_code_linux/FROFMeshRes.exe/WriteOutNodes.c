// write by yufenfen at 20200119
// write out Nodes Info of selected surfaces
#include "FROF.h"
#include <ctype.h>
#include <math.h> 

void WriteOutNodes(Coor* Coor0, Mesh* Mesh0, char* FileName, char* RFileName) {

    char FFileName[255];
 
    
    FILE *fp; 
 
    char meshname[255];
    char elemname[255];

    Coor0->nodeN  = 0;
    Mesh0->Type   = 0;
    Mesh0->Scale  = (int*)malloc(10*sizeof(int));
    Mesh0->EnodeN = (int*)malloc(10*sizeof(int));
    
    fp = fopen(FileName, "r");

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

    int NTag[Coor0->nodeN];
    for (int i=0; i<Coor0->nodeN; i++)
    NTag[i]=0;
 
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

        fgets(temp_str, 255, fp); 

        fgets(temp_str, 255, fp); 

        if (i==0) {

            for (int nod_i=0; nod_i<Coor0->nodeN; nod_i++) {

                fscanf (fp, "%d", &temp_int);
                
                for (int dim_i=0; dim_i<Coor0->dim; dim_i++) {

                    fscanf (fp, "%lf", &(Coor0->Coor[nod_i*Coor0->dim + dim_i]));
             
                }
            }
        }

        fgets(temp_str, 255, fp); 
      
        fgets(temp_str, 255, fp); 
    
        fgets(temp_str, 255, fp);
      
        
		ElemNodN = Mesh0->EnodeN[i];
		


        for (int elem_i=0; elem_i<Mesh0->Scale[i]; elem_i++) {

            fscanf (fp, "%d", &temp_int);

			int nod_j = 0;
            for (int nod_i=0; nod_i<ElemNodN + 1; nod_i++) {
				

                    fscanf (fp, "%d", &(Mesh0->Mesh[total_nodeN + elem_i*(Mesh0->EnodeN[i]+1) + (nod_j++)]));
            }
              
            nod_j = 0;    
            for (int nod_i=0; nod_i<ElemNodN; nod_i++) {
				

                    NTag[Mesh0->Mesh[total_nodeN + elem_i*(Mesh0->EnodeN[i]+1) + (nod_j++)] - 1] = 1;
            }
                            
        }

        fgets(temp_str, 255, fp); 

        total_nodeN += Mesh0->Scale[i]*(ElemNodN+1);
    }

    fclose(fp);

  

    char NFileName[255];

    char buf[100];
	int len=strlen(RFileName);
	int flag;
	for (int i = 0 ; i <= len-1; i++)
	{
		if (FileName[i] == '\\'|| FileName[i] == '/')
		{
			flag = i;
		}
	}

    strncpy(NFileName, RFileName,flag + 1);
    NFileName[flag+1] = 'N';
    for (int i = flag+1; i < len; i++)
	{
		NFileName[i + 1] = RFileName[i];
	}
	NFileName[len + 1] = '\0';
   

    fp = fopen(NFileName, "w");


    char *temp_str3;
    int compN;
    int start, end;
    int find_tag;
    int value_count;
    FILE *rfp;
   
    rfp=fopen(RFileName, "r");
    
    while(fgets(temp_str, 255, rfp) != NULL) {
      for (int i = 0; ;i++) {
        if (temp_str[i] != ' ') {
            temp_str1 = &(temp_str[i]);
            break;
            }
        }
            if (strncmp(temp_str1, "ComponentNames", 4) == 0) {

            compN = 0;
            int ii,jj; 
            for (int i = 0; ;i++) {
                if (temp_str1[i] == '"') 
                {    compN ++;
                    jj=i;
                }
                else if (temp_str1[i] == '\n' || temp_str1[i] == '\r')
       
                    break;
            }

            compN /= 2;


            char TempName[jj+2]; 
            strncpy(TempName, temp_str1, jj+1);
            TempName[jj+1] ='\0';
            fprintf(fp,"%s" , TempName);
            fprintf(fp," \"norm\"\n");
  

        }
            else if (isdigit(temp_str1[0])) {

            find_tag = 1; start = 0; end = 0; value_count = 0;
       
            double temp_vect[compN+1];
            for(int i=0; i<compN+1;i++)
            temp_vect[i]=0.;
        
            for (int i=0; ;i++) {

                if      (find_tag == 1) end   = i;
                else if (find_tag == 0) start = i;

                if (find_tag == 1 && 
                   (temp_str1[i] == ' '  || 
                    temp_str1[i] == '\n' || 
                    temp_str1[i] == '\r')) {
                    
                    temp_str3 = temp_str1 + start;

                    strncpy(temp_str2, temp_str3, end - start);
                    temp_str2[end - start] = '\0';
                     
                    int  index=atoi(temp_str2);
                    if(NTag[index-1]==0 && value_count==0 )
                    break;
                    //
                    temp_vect[value_count] = atof(temp_str2);          
                    //
                    fprintf(fp, "%s", temp_str2);
                    if(value_count == 0) {

                             for (int j=0; j<Coor0->dim; j++) {

                            fprintf(fp, " %.8E", Coor0->Coor[(index-1)*Coor0->dim+j]);

                         }


                         
                    
                    }
                    
                    if (value_count == compN)
                  
                        {fprintf(fp, "%s", " ");

                        double rms=0.;
                        for(int i=1; i<compN+1;i++)
                        rms += temp_vect[i]*temp_vect[i];
                        fprintf(fp, "%.8E", sqrt(rms));
                  
                        fprintf(fp, "%s", "\n");
                       }
                    else
                        fprintf(fp, "%s", " ");

                    value_count ++ ;

                    find_tag = 0;

                    if (temp_str1[i] == '\n' || temp_str1[i] == '\r')
                        break;
                }
                else if (find_tag == 0 && temp_str1[i] != ' ') {

                    find_tag = 1;
                }
            }
        }
        else
            fprintf(fp, "%s", temp_str1);
    }
    fclose(rfp);

    fclose(fp);
}
