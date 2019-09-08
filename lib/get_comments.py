
### START BOILERPLATE CODE

# Sample Python code for user authorization

import httplib2
import os
import sys

import googleapiclient.discovery
# from oauth2client.client import flow_from_clientsecrets
# from oauth2client.file import Storage
# from oauth2client.tools import argparser, run_flow

# The CLIENT_SECRETS_FILE variable specifies the name of a file that contains
# the OAuth 2.0 information for this application, including its client_id and
# client_secret.
# CLIENT_SECRETS_FILE = "./lib/credentials/client_secrets.json"

# Disable OAuthlib's HTTPS verification when running locally.
# *DO NOT* leave this option enabled in production.
os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

DEVELOPER_KEY = os.environ.get("YOUTUBE_API_KEY")

# This OAuth 2.0 access scope allows for full read/write access to the
# authenticated user's account and requires requests to use an SSL connection.
YOUTUBE_READ_WRITE_SSL_SCOPE = "https://www.googleapis.com/auth/youtube.force-ssl"
API_SERVICE_NAME = "youtube"
API_VERSION = "v3"
# comments_list(service,
#     part='snippet',
#     parentId='z13icrq45mzjfvkpv04ce54gbnjgvroojf0')
# This variable defines a message to display if the CLIENT_SECRETS_FILE is
# missing.
MISSING_CLIENT_SECRETS_MESSAGE = "WARNING: Please configure OAuth 2.0"

class GetComments:
	# Build a resource based on a list of properties given as key-value pairs.
	# Leave properties with empty values out of the inserted resource.
	def build_resource(properties):
	  resource = {}
	  for p in properties:
	    # Given a key like "snippet.title", split into "snippet" and "title", where
	    # "snippet" will be an object and "title" will be a property in that object.
	    prop_array = p.split('.')
	    ref = resource
	    for pa in range(0, len(prop_array)):
	      is_array = False
	      key = prop_array[pa]
	      # Convert a name like "snippet.tags[]" to snippet.tags, but handle
	      # the value as an array.
	      if key[-2:] == '[]':
	        key = key[0:len(key)-2:]
	        is_array = True
	      if pa == (len(prop_array) - 1):
	        # Leave properties without values out of inserted resource.
	        if properties[p]:
	          if is_array:
	            ref[key] = properties[p].split(',')
	          else:
	            ref[key] = properties[p]
	      elif key not in ref:
	        # For example, the property is "snippet.title", but the resource does
	        # not yet have a "snippet" object. Create the snippet object here.
	        # Setting "ref = ref[key]" means that in the next time through the
	        # "for pa in range ..." loop, we will be setting a property in the
	        # resource's "snippet" object.
	        ref[key] = {}
	        ref = ref[key]
	      else:
	        # For example, the property is "snippet.description", and the resource
	        # already has a "snippet" object.
	        ref = ref[key]
	  return resource

	# Remove keyword arguments that are not set
	def remove_empty_kwargs(self,**kwargs):
	  good_kwargs = {}
	  if kwargs is not None:
	    for key, value in kwargs.items():
	      if value:
	        good_kwargs[key] = value
	  return good_kwargs

	### END BOILERPLATE CODE

	# Sample python code for comments.list

	def comments_list(self, **kwargs):
		kwargs = self.remove_empty_kwargs(**kwargs)
		
		youtube = googleapiclient.discovery.build(
			API_SERVICE_NAME, 
			API_VERSION, 
			developerKey = DEVELOPER_KEY,
			cache_discovery=False
		)

		results = youtube.commentThreads().list(
			**kwargs
		).execute()

		comments = list()

		for item in results["items"]:
			comment = item["snippet"]["topLevelComment"]
			text = comment["snippet"]["textOriginal"]
			comments.append(text)

		return comments
