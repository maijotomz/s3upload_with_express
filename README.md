# s3upload_with_express
Easy image upload to s3 using express js


Clone the code and do the following steps

1)npm install


2)npm start - use this command to run the application.


2)Use a client side for uploading image and pass that to /upload endpoint



3)Add your s3 credentials to the corresponding areas mentioned



First implement an upload on your client side using any framework of your wish.



Upload the image from client side and using a POST request send the data to the '/upload' endpoint.



'${s3.getSignedUrl('getObject', { Bucket: "BUCKET_NAME", Key: "ORIGINAL_FILE_NAME" })}' . This is the script that give you the prsigned url from s3.



If you want you can use this script to generate new presigned url.



