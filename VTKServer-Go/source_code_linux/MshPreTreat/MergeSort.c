// write by zhanglicheng at 20191216
#include "FROF.h"

void mergeArray();

void MergeSort(Elem* elem, int first, int last, Elem* temp) {

    if (first < last) {
        int middle = first + (last - first)/2;
        MergeSort(elem, first, middle, temp);
        MergeSort(elem, middle+1, last, temp);
        mergeArray(elem, first, middle, last, temp);
    }
}

void mergeArray(Elem* elem, int first, int middle, int last, Elem* temp) {

    int i = first;
    int m = middle;
    int j = middle+1;
    int n = last;
    int k = 0;
    while (i<=m && j<=n) {
        if (elem[i].Tag <= elem[j].Tag) {
            temp[k].Tag  = elem[i].Tag;
            temp[k].node = elem[i].node;
            k++;
            i++;
        }else{
            temp[k].Tag  = elem[j].Tag;
            temp[k].node = elem[j].node;
            k++;
            j++;
        }
    }
    while(i<=m) {
        temp[k].Tag  = elem[i].Tag;
        temp[k].node = elem[i].node;
        k++;
        i++;
    }
    while(j<=n) {
        temp[k].Tag  = elem[j].Tag;
        temp[k].node = elem[j].node;
        k++;
        j++;
    }
    for (int ii=0; ii<k; ii++) {
        elem[first + ii].Tag  = temp[ii].Tag;
        elem[first + ii].node = temp[ii].node;
    }
}