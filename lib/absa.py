from textblob import TextBlob, Word
from string import punctuation
from nltk.corpus import stopwords
import re

def clean_sentence(sentence):
    sentence = re.sub(r"(?:\@|https?\://)\S+|\n+", "", sentence.lower())
    # Fix spelling errors in comments!
    sent = TextBlob(sentence)
    sent.correct()
    clean = ""
    for sentence in sent.sentences:
        words = sentence.words
        # Remove punctuations
        words = [''.join(c for c in s if c not in punctuation) for s in words]
        words = [s for s in words if s]
        clean += " ".join(words)
        clean += ". "
    return clean

def prune(comments):
    #compactness pruning:
    cleaned = list()
    for phrase in comments.noun_phrases:
        count = 0
        for word in phrase.split():
            # Count the number of small words and words without an English definition
            if len(word) <= 2 or (not Word(word).definitions):
                count += 1
        # Only if the 'nonsensical' or short words DO NOT make up more than 40% (arbitrary) of the phrase add
        # it to the cleaned list, effectively pruning the ones not added.
        if count < len(phrase.split())*0.4:
            cleaned.append(phrase)


    print("After compactness pruning:\nFeature Size:" + str(len(cleaned)))

    # ## Redundancy pruning:
    # I am using a naive decision of choosing the _largest common noun phrase_ as a non-redundant feature. A better way would be to find 'important' terms in common noun phrases and choose those. One approach to that could be something called TF-IDF (more about that [here](http://stevenloria.com/finding-important-words-in-a-document-using-tf-idf/)).

    for phrase in cleaned:
        match = list()
        temp = list()
        word_match = list()
        for word in phrase.split():
            # Find common words among all phrases
            word_match = [p for p in cleaned if re.search(word, p) and p not in word_match]
            # If the size of matched phrases set is smaller than 30% of the cleaned phrases,
            # then consider the phrase as non-redundant.
            if len(word_match) <= len(cleaned)*0.3 :
                temp.append(word)
                match += word_match

        phrase = ' '.join(temp)
    # print("Match for " + phrase + ": " + str(match))

        if len(match) >= len(cleaned)*0.1 :
            # Redundant feature set, since it contains more than 10% of the number of phrases.
            # Prune all matched features.
            for feature in match:
                if feature in cleaned:
                    cleaned.remove(feature)

            # Add largest length phrase as feature
            cleaned.append(max(match, key=len))

    print("After redundancy pruning:\nFeature Size:" + str(len(cleaned)))
    print("Cleaned features:" +  str(cleaned))

    return cleaned


def extract_features(cleaned, comments):
    # We now find the noun phrases with maximum frequencies and select the "frequent feature set" using a certain cutoff.

    feature_count = dict()
    for phrase in cleaned:
        count = 0
        for word in phrase.split():
            if word not in stopwords.words('english'):
                count += comments.words.count(word)

        print(phrase + ": " + str(count))
        feature_count[phrase] = count

    # Select frequent feature threshold as (max_count)/100
    # This is an arbitrary decision as of now.
    counts = list(feature_count.values())
    features = list(feature_count.keys())
    threshold = len(comments.noun_phrases)/100

    print("Threshold:" + str(threshold))

    frequent_features = list()

    for feature, count in feature_count.items():
        if count >= threshold:
            frequent_features.append(feature)

    print('Frequent Features:' + str(frequent_features))

    return frequent_features


def make_absa_list(frequent_features, result):
    # Feature Specific Sentiment Analysis
    # Now that we have the frequent features, we scan through the comments and find the sentences that contain these features. We then run sentiment analysis on these 'feature specific' sentences to get somewhat crude feature based sentiment scores. Further refinement will include generalizing the features, for e.g: "wonderful python library" could be generalized to "software", which will eventually lead to aspect wise sentiment scores.

    absa_list = dict()
    # For each frequent feature
    for f in frequent_features:
        # For each comment
        absa_list[f] = list()
        for comment in result:
            blob = TextBlob(comment)
            # For each sentence of the comment
            for sentence in blob.sentences:
                # Search for frequent feature 'f'
                q = '|'.join(f.split())
                if re.search(r'\w*(' + str(q) + ')\w*', str(sentence)):
                    absa_list[f].append(sentence)


    # print("Aspect Specific sentences:" + str(absa_list))
    return absa_list

def score_aspects(absa_list):
    # ## Aspect based sentiment scoring
    # Now that we have aspect specific sentences, all we have to do is run sentiment analysis on each sentence using TextBlob's sentiment analyzer.

    scores = list()
    absa_scores = dict()
    for k, v in absa_list.items():
        absa_scores[k] = list()
        for sent in v:
            score = sent.sentiment.polarity
            scores.append(score)
            absa_scores[k].append(score)

    return scores, absa_scores

def create_data_values(absa_scores):
    # Create data values for stripplot and boxplot
    vals = dict()
    vals["aspects"] = list()
    vals["scores"] = list()
    for k, v in absa_scores.items():
        for score in v:
            vals["aspects"].append(k)
            vals["scores"].append(score)

    return vals

# Function that calls all the other functions in sequence.
def analyze(result):
    result = [clean_sentence(x) for x in result]
    # Check sentiment polarity of each sentence.
    # sentiment_scores = list()
    # for sentence in result:
    #     line = TextBlob(sentence)
    #     sentiment_scores.append(line.sentiment.polarity)

    # Convert array of comments into a single string
    comments = TextBlob(' '.join(result))

    cleaned = prune(comments)
    frequent_features = extract_features(cleaned, comments)
    absa_list = make_absa_list(frequent_features,result)
    scores, absa_scores = score_aspects(absa_list)
    data_values = create_data_values(absa_scores)

    return data_values
