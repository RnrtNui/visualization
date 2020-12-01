// write by zhanglicheng at 20191218
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>

int main(int argc, char* argv[]) {

    FILE *fpr, *fpw;
    fpr = fopen(argv[1], "r");

    char filew[255];

    char buf[100];
	int len=strlen(argv[1]);
	int flag;
	for (int i = 0 ; i <= len-1; i++)
	{
		if (argv[1][i] == '\\'|| argv[1][i] == '/')
		{
			flag = i;
		}
	}
	strncpy(filew, argv[1], flag + 1);
	filew[flag+1] = 'T';
	for (int i = flag+1; i < len; i++)
	{
		filew[i + 1] = argv[1][i];
	}
	filew[len + 1] = '\0';


    fpw = fopen(filew, "w");

    char  temp_str[255];
    char *temp_str1;
    char  temp_str2[48];
    char *temp_str3;
    int compN;
    int start, end;
    int find_tag;
    int value_count;

    while(fgets(temp_str, 255, fpr) != NULL) {

        for (int i = 0; ;i++) {
            if (temp_str[i] != ' ') {
                temp_str1 = &(temp_str[i]);
                break;
            }
        }
        
        if (strncmp(temp_str1, "ComponentNames", 4) == 0) {

            compN = 0;

            for (int i = 0; ;i++) {
                if (temp_str1[i] == '"') 
                    compN ++;
                else if (temp_str1[i] == '\n' || temp_str1[i] == '\r')
                    break;
            }

            compN /= 2;

            fprintf(fpw, "%s", temp_str1);
        }
        
        else if (isdigit(temp_str1[0])) {

            find_tag = 1; start = 0; end = 0; value_count = 0;

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

                    fprintf(fpw, "%s", temp_str2);

                    if (value_count == compN)
                        fprintf(fpw, "%s", "\n");
                    else
                        fprintf(fpw, "%s", " ");

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
            fprintf(fpw, "%s", temp_str1);
    }

    fclose(fpr);
    fclose(fpw);
}