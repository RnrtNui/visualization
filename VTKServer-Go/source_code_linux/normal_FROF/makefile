##################################################
# makefile to compile viztrans
# written by Zheng Liang @ 2020-2-18
# E-mail: liangzh.cug@gmail.com
##################################################
SRC =$(wildcard *.c)

CC= gcc -O3 -std=c99
CXX = g++ -O3

RM = rm -rf

all: viztrans.exe

.SUFFIXES: .cpp .c
.cpp.o:
	${CXX} -c $<

.c.o:
	${CC} -c $<

viztrans.exe: ${SRC}
	${CC} -o normal_FROF.exe $? -lm

clean:
	${RM} *.exe *.o *.a
