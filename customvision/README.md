<a name="HOLTitle"></a>
# Using the Microsoft Custom Vision Service to Perform Image Classification of Cars #

[Microsoft Cognitive Services](https://azure.microsoft.com/en-us/services/cognitive-services/ "Microsoft Cognitive Services") is a suite of services and APIs backed by machine learning that enables developers to incorporate intelligent features such as facial recognition in photos and videos, sentiment analysis in text, and language understanding into their applications. Microsoft's [Custom Vision Service](https://azure.microsoft.com/en-us/services/cognitive-services/custom-vision-service/) is among the newest members of the Cognitive Services suite. Its purpose is to create image classification models that "learn" from labeled images you provide. Want to know if a photo contains a picture of a flower? Train the Custom Vision Service with a collection of flower images, and it can tell you whether the next image includes a flower — or even what type of flower it is.

![](Images/custom-vision-details.jpg)

The Custom Vision Service enables organizations to develop domain-specific image-classification models and use it to analyze image content. Examples include identifying a dog's breed from a picture of the dog, analyzing images for adult content, and identifying defective parts produced by manufacturing processes. It was recently used to [help search-and-rescue drones](https://blogs.technet.microsoft.com/canitpro/2017/05/10/teaching-drones-to-aid-search-and-rescue-efforts-via-cognitive-services/) identify objects such as boats and life vests in large bodies of water and recognize potential emergency situations in order to notify a rescue squad without waiting for human intervention.

The Custom Vision Service exposes two APIs: the [Custom Vision Training API](https://southcentralus.dev.cognitive.microsoft.com/docs/services/d9a10a4a5f8549599f1ecafc435119fa/operations/58d5835bc8cb231380095be3) and the [Custom Vision Prediction API](https://southcentralus.dev.cognitive.microsoft.com/docs/services/eb68250e4e954d9bae0c2650db79c653/operations/58acd3c1ef062f0344a42814). You can build, train, and test image-classification models using the [Custom Vision Service portal](https://www.customvision.ai/), or you can build, train, and test them using the Custom Vision Training API. Once a model is trained, you can use the Custom Vision Prediction API to build apps that utilize it. Both are REST APIs that are easily called from a variety of programming languages.

In this lab, you will create a Custom Vision Service model, train it with images of BMW cars, and utilize the model from a Node.js app to identify the specific model of BMW in a picture. Along the way, you will learn how to train a Custom Vision Service model and leverage it from your apps using REST APIs.

<a name="Objectives"></a>
### Objectives ###

In this hands-on lab, you will learn how to:

- Create a Custom Vision Service project 
- Train a Custom Vision Service model with tagged images  
- Test a Custom Vision Service model 
- Create apps that leverage Custom Vision Service models by calling REST APIs 

<a name="Prerequisites"></a>
### Prerequisites ###

The following are required to complete this hands-on lab:

- A Microsoft account. If you don't have one, [sign up for free](https://account.microsoft.com/account).
- Microsoft [Visual Studio Code](http://code.visualstudio.com) version 1.14.0 or higher
- [Node.js](https://nodejs.org) version 6.0 or higher

<a name="Resources"></a>
### Resources ###

All the resources you need are all located inside the `resources` sub-folder which is located in the same folder as this README file.

You should first either clone this repository, or download and unpack it onto your hard drive.

The `resources` folder itself contains two sub-folders:

* `clientapp` - a desktop app written in Electron which you will use to test your custom vision model
* `images` - images of various types of BMW cars. There is a `train` folder with labeled pictures which you will use to train the model, and a `test` folder with random images to use for testing your model.

<a name="Cost"></a>
### Cost ###

![](Images/cost-0.png)

There is no cost associated with this lab because it doesn't require an Azure subscription.

<a name="Exercises"></a>
## Exercises ##

This hands-on lab includes the following exercises:

- [Exercise 1: Create a Custom Vision Service project](#Exercise1)
- [Exercise 2: Upload tagged images](#Exercise2)
- [Exercise 3: Train the model](#Exercise3)
- [Exercise 4: Test the model](#Exercise4)
- [Exercise 5: Create a Node.js app that uses the model](#Exercise5)
- [Exercise 6: Use the app to classify images](#Exercise6)

Estimated time to complete this lab: **45** minutes.

<a name="Exercise1"></a>
## Exercise 1: Create a Custom Vision Service project ##

The first step in building an image-classification model with the Custom Vision Service is to create a project. In this exercise, you will use the Custom Vision Service portal to create a Custom Vision Service project.

1. Open the [Custom Vision Service portal](https://www.customvision.ai/) in your browser. Then click **Sign In**. 
 
    ![Signing in to the Custom Vision Service portal](Images/portal-sign-in.png)

    _Signing in to the Custom Vision Service portal_

1. If you are asked to sign in, do so using the credentials for your Microsoft account. If you are asked to let this app access your info, click **Yes**, and if prompted, agree to the terms of service.

1. Click **New Project** to create a new project.
  
	![Creating a Custom Vision Service project](Images/portal-click-new-project.png)

    _Creating a Custom Vision Service project_

1. In the "New project" dialog, name the project **BMW Cars** ensure that **General** is selected as the domain, and click **Create project**.

	> A domain optimizes a model for specific types of images. For example, if your goal is to classify food images by the types of food they contain or the ethnicity of the dishes, then it might be helpful to select the Food domain. For scenarios that don't match any of the offered domains, or if you are unsure of which domain to choose, select the General domain.

	![Creating a Custom Vision Service project](Images/portal-create-project.png)

    _Creating a Custom Vision Service project_

The next step is to upload images to the project and assign tags to those images to classify them.

<a name="Exercise2"></a>
## Exercise 2: Upload tagged images ##

In this exercise, you will add images of BMW cars, and tag every image with the model name, so the Custom Vision Service can learn to differentiate one BMW model from another.
  
1. Click **Add images** to add images to the project.

	![Adding images to the project](Images/portal-click-add-images.png)

    _Adding images to the project_ 
 
1. Click **Browse local files**.

	![Browsing for local images](Images/portal-click-browse-local-files.png)

    _Browsing for local images_ 
 
1. Browse to the `resources\images\bmw_cars\train\E60` folder, select all of the files in the folder, and click **Open**.

	![Selecting images](Images/fe-browse-01.png)

    _Selecting images_ 
 
1. Type `E60` into the **Add some tags...** box. Then click **+** to assign the tag to the images.

	![Adding a tag to the images](Images/portal-add-tags-01.png)

    _Adding a "E60" tag to the images_ 

1. Repeat Steps 3 and 4 to add at least two or three more tags to the project, and assign the respective images to each tag. You can even add all of the tags and images in the `train` folder if you want.

With the tagged images uploaded, the next step is to train the model with these images so it can distinguish between the various BMW models.

<a name="Exercise3"></a>
## Exercise 3: Train the model ##

In this exercise, you will train the model using the images uploaded and tagged in the previous exercise. Training can be accomplished with a simple button click in the portal, or by calling the [TrainProject](https://southcentralus.dev.cognitive.microsoft.com/docs/services/d9a10a4a5f8549599f1ecafc435119fa/operations/58d5835bc8cb231380095bed) method in the [Custom Vision Training API](https://southcentralus.dev.cognitive.microsoft.com/docs/services/d9a10a4a5f8549599f1ecafc435119fa/operations/58d5835bc8cb231380095be3). Once trained, a model can be refined by uploading additional tagged images and retraining it.
 
1. Click the **Train** button at the top of the page to train the model. Each time you train the model, a new iteration is created. The Custom Vision Service maintains several iterations, allowing you to compare your progress over time.

	![Training the model](Images/portal-click-train.png)

    _Training the model_

1. Wait for the training process to complete. (It should only take a few seconds.) Then review the training statistics presented to you for iteration 1. 

    **Precision** and **recall** are separate but related  measures of the model's accuracy. You can learn more about precision and recall from https://en.wikipedia.org/wiki/Precision_and_recall.

	![Results of training the model](Images/portal-train-complete.png)

    _Results of training the model_ 

Now let's test the model using the portal's Quick Test feature, which allows you to submit images to the model and see how it classifies them using the knowledge gained from the training images.

<a name="Exercise4"></a>
## Exercise 4: Test the model ##

In [Exercise 5](#Exercise5), you will create a Node.js app that uses the model to identify the correct BMW model in images presented to it. But you don't have to write an app to test the model; you can do your testing in the portal, and you can further refine the model using the images that you test with. In this exercise, you will test the model's ability to identify the BMW model using test images provided for you.

1. Click **Quick Test** at the top of the page.
 
	![Testing the model](Images/portal-click-quick-test.png)

    _Testing the model_ 

1. Click **Browse local files**, and then browse to the `resources\images\bmw_cars\test` folder in the lab resources. Select any image, and click **Open**.

	![Selecting a test image](Images/portal-select-test-01.png)

    _Selecting a test image_ 

1. Examine the results of the test in the "Quick Test" dialog. What is the probability that the car is an E60 or another model?

1. Try a couple more test images and examine the results. How is the model performing? Any ideas on how we might improve such a model?

Now let's go a step further and incorporate the model's intelligence into an app.

<a name="Exercise5"></a>
## Exercise 5: Create a Node.js app that uses the model ##

The true power of the Microsoft Custom Vision Service is the ease with which developers can incorporate its intelligence into their own applications using the [Custom Vision Prediction API](https://southcentralus.dev.cognitive.microsoft.com/docs/services/eb68250e4e954d9bae0c2650db79c653/operations/58acd3c1ef062f0344a42814). In this exercise, you will use Visual Studio Code to modify an app to use the model you built and trained in previous exercises.

1. If Node.js isn't installed on your system, go to https://nodejs.org and install the latest LTS version for your operating system.

	> If you aren't sure whether Node.js is installed, open a Command Prompt or terminal window and type **node -v**. If you don't see a Node.js version number, then Node.js isn't installed. If a version of Node.js older than 6.0 is installed, it is highly recommend that you download and install the latest version.

1. If Visual Studio Code isn't installed on your workstation, go to http://code.visualstudio.com and install it now.

1. Start Visual Studio Code and select **Open Folder...** from the **File** menu. In the ensuing dialog, select the `resources\clientapp` folder included in the lab resources.

	![Selecting the client app folder](Images/fe-select-folder.png)

    _Selecting the client app folder_ 

1. Use the **View** > **Terminal** command to open a terminal window in Visual Studio Code. Then execute the following command in the integrated terminal to load the packages required by the app:

	```
	npm install
	```

1. Return to the BMW Cars project in the Custom Vision Service portal, click **Performance**, and then click **Make default** to make sure the latest iteration of the model is the default iteration. 

	![Specifying the default iteration](Images/portal-make-default.png)

    _Specifying the default iteration_ 

1. Before you can run the app and use it to call the Custom Vision Service, it must be modified to include endpoint and authorization information. To that end, click **Prediction URL**.

	![Viewing Prediction URL information](Images/portal-prediction-url.png)

    _Viewing Prediction URL information_ 

1. The ensuing dialog lists two URLs: one for uploading images via URL, and another for uploading local images. Copy the Prediction API URL for image files to the clipboard. 

	![Copying the Prediction API URL](Images/copy-prediction-url.png)

    _Copying the Prediction API URL_ 

1. Return to Visual Studio Code and click **predict.js** to open it in the code editor.

	![Opening predict.js](Images/vs-predict-file.png)

    _Opening predict.js_ 

1. Replace `<Custom Vision Prediction URI>` with the URL on the clipboard.

    ```js
    // Replace <Custom Vision Prediction URI> with your valid Prediction URI for Custom Vision.
    const predictionUri = '<Custom Vision Prediction URI>';
    ```

1. Return to the Custom Vision Service portal and copy the Prediction API key to the clipboard. 

	![Copying the Prediction API key](Images/copy-prediction-key.png)

    _Copying the Prediction API key_ 

1. Return to Visual Studio Code and replace `<Prediction Key>` with the API key on the clipboard.

    ```js
    // Replace <Prediction Key> with your valid prediction key.
    const predictionKey = '<Prediction Key>';
    ```

1. Scroll down in **predict.js** and examine the block of code that begins on line 34. This is the code that calls out to the Custom Vision Service using AJAX. Using the Custom Vision Prediction API is as easy as making a simple, authenticated POST to a REST endpoint.

    ```js
        $.ajax({
            type: "POST",
            url: predictionUri,
            data: imageBytes,
            processData: false,
            headers: {
                "Prediction-Key": predictionKey,
                "Content-Type": "multipart/form-data"
            }
        }).done(function (data) {

            var predictions = data.predictions;
            ...
    ```

    _Making a call to the Prediction API_ 

1. Return to the integrated terminal in Visual Studio Code and execute the following command to start the app:

	```
	npm start
	```


The client app is a cross-platform app written with Node.js and [Electron](https://electron.atom.io/). As such, it is equally capable of running on Windows, macOS, and Linux. In the next exercise, you will use it to classify images of BMW cars and display them.

<a name="Exercise6"></a>
## Exercise 6: Use the app to classify images ##

In this exercise, you will use the app to submit images to the Custom Vision Service for classification. The app uses the JSON information returned from calls to the Custom Vision Prediction API's [PredictImage](https://southcentralus.dev.cognitive.microsoft.com/docs/services/eb68250e4e954d9bae0c2650db79c653/operations/58acd3c1ef062f0344a42814) method to tell you what type of BMW model the picture contains. It also shows the probability that the classification assigned to the image is correct.

1. Click the **Browse (...)** button in the  app. 

1. Browse to the `tests` folder in the lab resources. Select any image file and then click **Open**.

1. Click the **Predict** button to submit the image to the Custom Vision Service.

	![Submitting the image to the Custom Vision Service](Images/app-click-predict.png)

    _Submitting the image to the Custom Vision Service_ 

1. Check that the app identifies the image as a specific BMW model. Is that the correct model of the car?
 
1. Repeat steps 1 through 4 for a random image (not containing any car) and confirm that the app does **not** classify the image as any known BMW model.

	![Submitting the image to the Custom Vision Service](Images/app-click-predict-unknown.png)

    _Submitting a non-car image to the Custom Vision Service_ 

1. As you can see, using the Prediction API from an app is just as reliable as through the Custom Vision Service portal — and way more fun! What's more, if you go to the Predictions page in the portal, you'll find that each of the images uploaded via the app is shown there as well.
 
Feel free to test with more images of your own and gauge the model's adeptness at identifying the right BMW model. And remember that in general, the more images you train with, the smarter the model will be.

<a name="Summary"></a>
## Summary ##

Image classification is playing an increasingly large role in industry as a means for automating such tasks as checking images uploaded to Web sites for offensive content and inspecting parts rolling off of assembly lines for defects. Building an image-classification model manually — that is, coding it from the ground up in Python, R, or another language — requires no small amount of expertise, but the Custom Vision Service enables virtually anyone to build sophisticated image-classification models. And once a model is built and trained, an app that uses it is only few lines of code away.

---

Copyright 2018 Microsoft Corporation. All rights reserved. Except where otherwise noted, these materials are licensed under the terms of the MIT License. You may use them according to the license as is most appropriate for your project. The terms of this license can be found at https://opensource.org/licenses/MIT.
