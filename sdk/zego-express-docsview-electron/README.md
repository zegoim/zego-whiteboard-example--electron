<div align="center">

# zego-express-docsview-electron

![](https://img.shields.io/badge/-zego-%2351A8DD)
![](https://img.shields.io/badge/%E6%96%87%E4%BB%B6%E8%BD%AC%E7%A0%81-docsview-orange)
![](https://img.shields.io/badge/electron-5.x.x-%23A8497A)

</div>

## Prerequisites

1. Electron 5.x.x
2. node.js - windows 32-bit or macOS 64-bit

## Installation

    npm install zego-express-docsview-electron

## Quick Start

Create a ZEGO account and get AppID and AppSign required for SDK initialization at [ZEGO management console](https://doc-en.zego.im/en/1271.html)

    // init sdk
    const ZegoExpressDocs = window.require('zego-express-docsview-electron')
    const zegoExpressDocs = new ZegoExpressDocs({
        appID,
        appSign, // Array
        dataFolder,
        cacheFolder,
        logFolder,
        isTestEnv
    });
    // create Docsview
    let docView = zegoExpressDocs.createView(parentID);

## Resources

1. [Doc Center](https://doc-zh.zego.im/zh/6491.html) - See more docs about zego-express-docsview-electron

## ChangeLog

### v1.22.0

-   When uploading the file, add check whether the file suffix name exists or not, and error code 2020009 will be thrown.
-   When uploading files, when the rendering mode type ZegoDocsViewRenderType does not meet the platform requirements, the error code 2010003 will be thrown in onError.

**fix:**

-   Fix the problem that the left and right keys of dynamic PPT file skip incorrectly.
-   Fix the problem that stopPlay can't stop the audio

**Update:**

### v1.21.0

![](https://img.shields.io/badge/-2021--05--31-%23D4DFE6)

**Add:**

-   Added the thumbnail definition setting function, which supports setting the thumbnail definition.

**Update:**

-   Added file transcoding error code.

### v1.20.0

![](https://img.shields.io/badge/-2021--04--29-%23D4DFE6)

**Add:**

-   Added support for H5 file type Upload H5 files through the uploadH5File interface.
-   Added the function of preloading dynamic PPT and H5 files.
    Through the cacheFile interface, dynamic PPT and H5 files can be preloaded and cached locally to improve the speed of loading and displaying files. Please contact ZEGO technical support to enable this function.

**Update:**

-   Optimize PDF empty file check.
-   Optimize the drawing of PDF file dividing line.
-   Optimize the display of the view hierarchy when multiple files are loaded at the same time.
-   Add the following error codes.

### v1.19.0

![](https://img.shields.io/badge/-2021--04--01-%23D4DFE6)

**Update:**

-   Optimize dynamic PPT permission control

### v1.17.0

![](https://img.shields.io/badge/-2021--02--01-%23D4DFE6)

**fix:**

-   fix fileName error
-   fix upload local file error

### 0.16.0

![](https://img.shields.io/badge/-2021--01--21-%23D4DFE6)

**update:**

-   update setConfig - DynamicPPTHD
-   Optimize the display clarity of static files on the HD screen
-   Automatically switch the backup CDN when file loading timeout or failure
-   Support HEIC format file upload

**fix:**

-   Solve the problem of incorrect rendering and filling mode of PDF files converted from PPT
