#This program is written on 21st August. This is still in development version.
import sys
import json
import numpy as np
import scipy
import csv
from scipy import sparse
from scipy.sparse import csr_matrix
from scipy.sparse.linalg import lsqr
import pickle
import os
import operator
import random
import timeit


join_article_keywords = []
join_article_new_keywords = []
# Load the data that PHP sent us
DupClickedKeyword = json.loads(sys.argv[1])

if len(DupClickedKeyword) == 1:

	#This function shuffles the data
	def my_shuffle(array):
        	random.shuffle(array)
       	 	return array

       	 #Load the data from a json file
       	json_data=open('final_modified_data.json')
	article_data = json.load(json_data)
	json_data.close()

	x = article_data["articles"]
	article_shuffle = my_shuffle(x)

	#Extracting original keywords from json
	extract_article_keywords = article_shuffle[0]['modified_keywords']
	for i in extract_article_keywords:
		join_article_keywords.append(i.encode("utf-8"))

	#Extracting matched keywords from json
	extract_article_keywords_new_inserted = article_shuffle[0]['new_keywords']
	for i in extract_article_keywords_new_inserted:
		join_article_new_keywords.append(i.encode("utf-8"))

	#Joining the original keywords and matched keywords
	joined_keywords = join_article_keywords + join_article_new_keywords

	#read the initial display keywords
	file = open('Modified_Keyword_List.txt', 'r')
	initial_keyword_list = file.readlines()


	#shuffle the keywords
	shuffledis =[0 for i in range(len(initial_keyword_list))]
	shuffledis = my_shuffle(initial_keyword_list)

	#initialize the array to send the shuffled keywords
	finaldis =[0 for i in range(100)]

	for s in range(len(finaldis)):
        	finaldis[s] = shuffledis[s]

	checkList = {"keywords":[dict(keyword=pn) for pn in finaldis], "status_check": "ok", "target_article_details": article_shuffle[0], "target_keywords":[dict(keyword=pn) for pn in joined_keywords]}

	#send the shuffle keywords to php
	print json.dumps(checkList)

else:		
		
	DupClickedKeyword.pop(0)
	target_title = DupClickedKeyword.pop(0)
	length_keywords = DupClickedKeyword.pop(0)
	target_keywords = []
	for i in range(0,length_keywords):
		target_keywords.append(DupClickedKeyword[i])

	del DupClickedKeyword[0:length_keywords]


	#This is the regression function
	def Reg(X,Z,position, rows):
		start_time = timeit.default_timer()
		Y = X[:,position]
		Z = Y.sum(axis=1)
		F = Z.reshape(rows,1)
		elapsed = timeit.default_timer() - start_time
		sXS = sparse.csr_matrix(X)
		all_cols = np.arange(sXS.shape[1])
		cols_to_keep = np.where(np.logical_not(np.in1d(all_cols, position)))[0]
		m = sXS[:, cols_to_keep]
		g = m.A.T
		g1 = scipy.sparse.vstack([np.ones(rows),g]).T
		coeff_beta = lsqr(g1, F)[0]
		final_array = np.dot(g1.toarray(),coeff_beta)
		return X,Z, coeff_beta, final_array


	#This is the Relevance function
	def Relevance(s):
		sum_relevance = 0
		if type(s) is str:		
			sum_relevance = sum_relevance + all_keywords_dictionary.get(s)
		else:
			for i in s:
				sum_relevance = sum_relevance + all_keywords_dictionary.get(i)
		return sum_relevance
		
	#This is the Diversity function - a bit modified in this case, we I am using the "clicked keyword" in this case
	def Diversity(positionKeyword,column_names_list,c):
		r = 0
		modified_r = 0
		if(len(positionKeyword) == 1):
			a = positionKeyword[0]
			for i in range(len(column_names_list)):
				r = r + c[a][i]
			avg_r = r / len(column_names_list)
			modified_r = (-(avg_r * avg_r) + 1)
		else:
			for i in positionKeyword:
				for j in positionKeyword:
					if i != j:
						a = i
						b = j
						r = r +c[a][b]
			modified_r = -1 * r
		return modified_r


	#Reading the tf-idf matrix from disk		
	doc_matrix = np.load("Modified_Matched_Data.npy")
	data = doc_matrix
		
	#Reading the keyword list of size 12K approx.		
	column_names_list = [line.strip() for line in open('Modified_Keyword_List.txt')]

	clickedKeyword = list(set(DupClickedKeyword))

	#Declaring an empty list
	positionKeyword = []

	#Find the positions of clicked keywords and store them in the list and Deleting the keywords from the keywordlist by name of keywords
	for i in clickedKeyword:
		positionKeyword.append(column_names_list.index(i))
		if i in column_names_list:
			column_names_list.remove(i)

	#Initializing an array for use in regeression
	rows =  data.shape[0]
	Z = [0]*rows		
	

	#Calling the Regression function
	data, Z, coeff, ranked_array = Reg(data, Z, positionKeyword, rows)		


	# converting coefficant matrix to list
	K = list(np.array(coeff).reshape(-1,)) 

	# removing the first element from the coefficiant list, so that the dimension matches with that of keywords
	K.pop(0) 

	# converting ranking matrix to list
	d = list(np.array(ranked_array).reshape(-1,)) 

	# sorting keywords according to coefficant score
	sortedKeywords = [i[0] for i in sorted(zip(column_names_list,K), key=lambda l: l[1], reverse=True)]

	#Reading the article titles from the file
	docs = [line.strip() for line in open('Modified_Correct_Title_List.txt')]

	# sorting documents according to ranking score
	sortedDocuments = [i[0] for i in sorted(zip(docs,d), key=lambda l: l[1], reverse=True)] 

	# slicing first 100 keywords
	displayedKeywords = sortedKeywords[0:100] # slicing first 100 keywords

	# slicing first 20 documents
	displayedDocuments = sortedDocuments[0:20] 

	#sort the ranking score
	sortedRank = sorted(d, reverse=True)

	#sort the coefficiants
	sortedCoeff = sorted(K, reverse=True)

	# slicing first 100 coefficiants
	displayCoeff = sortedCoeff[0:100]

	# slicing first 20 ranking score
	displayRank = sortedRank[0:20]

	#DocumentRank = sortedDocuments.index('Rethinking the ESP game')
	DocumentRank = sortedDocuments.index(target_title)
	rankDoc = []
	rankDoc.append(DocumentRank)

	#Find the score of the particular index
	DocumentScore = sortedRank[DocumentRank]

	#Create dictionary for all keywords/coefficants arranged in order from highest to lowest
	all_keywords_dictionary = dict(zip(sortedKeywords,sortedCoeff))

	dummyscore = []
	for i in range(0,length_keywords):
		z = all_keywords_dictionary.get(target_keywords[i])
		dummyscore.append(z)

	#Create dictionary for top 100 keywords/coefficiants
	keywords_dictionary = dict(zip(displayedKeywords,displayCoeff))

	#Create dictionary for top 100 articles/ranks
	articles_dictionary = dict(zip(displayedDocuments,displayRank))

	#target_keywords_dictionary = dict(zip(dummyscore, target_keywords))
	target_keywords_dictionary = dict(zip(target_keywords, dummyscore))
	
	#Calling the function to calculate the relevance
	#Relevance(clickedKeyword)

	#Read the pearson coefficiant matrix
	c = np.load("Modified_Pearson_Matrix.npy")

	#Calling the function to calculate the diversity
	calculated_diversity = Diversity(positionKeyword, column_names_list, c)

	#Create the json to send to client	
	return_json = {"keywords":[{"keyword": key,"score":value} for key, value in sorted(keywords_dictionary.iteritems(), reverse = True,key=lambda (k,v): (v,k))],"articles":[{"title":key, "score":value} for key, value in sorted(articles_dictionary.iteritems(), reverse = True,key=lambda (k,v): (v,k))], "target_keywords":[{"keyword": key,"score":value} for key, value in sorted(target_keywords_dictionary.iteritems(), reverse = True,key=lambda (k,v): (v,k))], "target_article":{"score": DocumentScore,"rank":DocumentRank}, "diversity": calculated_diversity}

	#Send data back to PHP
	print json.dumps(return_json)




