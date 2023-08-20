(function(){
    let btnAddFolder = document.querySelector("#addFolder");
    let btnAddTextFile = document.querySelector("#addTextFile");
    let breadCrumb = document.querySelector("#breadcrumb");
    let aRootPath = breadCrumb.querySelector("a[purpose='path']");

    let container = document.querySelector("#container");
    let templates = document.querySelector("#templates");
    
    let divApp = document.querySelector("#app");
    let divAppTitleBar = document.querySelector("#app-title-bar");
    let divAppMenuBar = document.querySelector("#app-menu-bar");
    let divAppBody = document.querySelector("#app-body");
    let divAppTitle = document.querySelector("#app-title");
    let appClose = document.querySelector("#app-close");
    
    let resources = [];
    let cfid = -1;   // initially we are at root folder (which has id = -1). It is pid
    let rid = 0;

    btnAddFolder.addEventListener("click", addFolder);
    btnAddTextFile.addEventListener("click", addTextFile);
    aRootPath.addEventListener("click", viewFolderFromBreadcrumb);
    appClose.addEventListener("click", closeApp);

    function closeApp() {
        divAppTitle.innerHTML = "Title will come here";
        divAppTitle.setAttribute("rid", "");
        divAppMenuBar.innerHTML = "";
        divAppBody.innerHTML = "";
    }

    // validation - non blank name , no duplicate names
    function addFolder() {
        let rname = prompt("Enter New Folder Name ");
        if (rname != null) {
            rname = rname.trim(); 
        }

        if (!rname) {   // empty name validation
            alert("Folder Name can not be empty ");
            return;
        }

        // unique name validation
        let alreadyExist = resources.some(r => r.rname == rname && r.pid == cfid);
        if (alreadyExist) {     
            alert("Folder named {" + rname + "} already exists.Please enter a unique name!");
            return;
        }

        rid++;
        let pid = cfid;
        // add to html
        addFolderHTML(rname, rid, cfid);

        // add to ram
        resources.push({
            id : rid,
            rname : rname, 
            rtype : "folder", 
            pid : cfid
        })
        // storage
        saveToStorage();    
    }

    function addFolderHTML(rname, rid, pid) {

        let divFolderTemplate = templates.content.querySelector(".folder");
        let divFolder = document.importNode(divFolderTemplate, true);

        let divName = divFolder.querySelector("[purpose='name']");
        let spanDelete = divFolder.querySelector("[action='delete']");
        let spanRename = divFolder.querySelector("[action='rename']");
        let spanView = divFolder.querySelector("[action='view']");
        
        divName.innerHTML = rname;
        spanDelete.addEventListener("click", deleteFolder);
        spanRename.addEventListener("click", renameFolder);
        spanView.addEventListener("click", viewFolder);

        divFolder.setAttribute("rid", rid);
        divFolder.setAttribute("pid", pid);

        container.appendChild(divFolder);
    }

    function addTextFile () {
        let rname = prompt("Enter New Text File Name ");
        if (rname != null) {
            rname = rname.trim(); 
        }

        if (!rname) {   // empty name validation
            alert("Name can not be empty ");
            return;
        }

        // unique name validation
        let alreadyExist = resources.some(r => r.rname == rname && r.pid == cfid);
        if (alreadyExist) {     
            alert("File named {" + rname + "} already exists.Please enter a unique name!");
            return;
        }

        rid++;
        let pid = cfid;
        // add to html
        addTextFileToHTML(rname, rid, cfid);

        // add to ram
        resources.push({
            id : rid,
            rname : rname,
            rtype : "text-file", 
            pid : cfid,

            isBold : false,
            isItalic : false,
            isUnderline : false,
            BGcolor : "#A6E3E9",
            textColor : "#000000",
            fontFamily : "cursive",
            fontSize : 20,
            content : "I am a new file!!"
        })

        // storage
        saveToStorage();    
    }

    function addTextFileToHTML(rname, rid, pid) {
        let divTextFileTemplate = templates.content.querySelector(".text-file");
        let divTextFile = document.importNode(divTextFileTemplate, true);

        let divName = divTextFile.querySelector("[purpose='name']");
        let spanDelete = divTextFile.querySelector("[action='delete']");
        let spanRename = divTextFile.querySelector("[action='rename']");
        let spanView = divTextFile.querySelector("[action='view']");
        
        divName.innerHTML = rname;
        spanDelete.addEventListener("click", deleteTextFile);
        spanRename.addEventListener("click", renameTextFile);
        spanView.addEventListener("click", viewTextFile);

        divTextFile.setAttribute("rid", rid);
        divTextFile.setAttribute("pid", pid);

        container.appendChild(divTextFile);
    }

    function deleteFolder() { 
        // delete all folders inside also
        let spanDelete = this;
        let divFolder = spanDelete.parentNode;
        let divName = divFolder.querySelector("[purpose='name']");

        let fname = divName.innerHTML;
        let fidTBD = parseInt(divFolder.getAttribute("rid"));       // TBD = to be deleted

        let childrenExist = resources.some(r => r.pid == fidTBD);


        let sure = confirm("Are you sure you want to delete '" + fname + "' ?" + (childrenExist? ". It also has children" : ""));
        if (!sure) {
            return;
        }

        // remove from html
        container.removeChild(divFolder);

        // ram
        deleteDFS(fidTBD);

        // storage
        saveToStorage();
    }

    function deleteDFS(fidTBD) {
        let children = resources.filter(r => r.pid == fidTBD);
        for (let i = 0; i < children.length; i++) {
            deleteDFS(children[i].id)  // faith : this deletes children and their children recursively
        }

        let ridx = resources.findIndex(r => r.id == fidTBD);
        resources.splice(ridx, 1);
    }

    function deleteTextFile() {
        let spanDelete = this;
        let divTextFile = spanDelete.parentNode;
        let divName = divTextFile.querySelector("[purpose='name']");

        let fname = divName.innerHTML;
        let fidTBD = parseInt(divTextFile.getAttribute("rid"));       // TBD = to be deleted


        let sure = confirm("Are you sure you want to delete '" + fname + "' ?");
        if (!sure) {
            return;
        }

        // remove from html
        container.removeChild(divTextFile);

        // ram
        let ridx = resources.findIndex(r => r.id == fidTBD);
        resources.splice(ridx, 1);

        // storage
        saveToStorage();
    }

    function renameFolder() {
        let nrname = prompt("Enter New Folder Name ");
        if (nrname != null) {
            nrname = nrname.trim(); 
        }

        // empty name validation
        if (!nrname) {   
            alert("Folder Name can not be empty ");
            return;
        }
        // old name validation
        let spanRename = this;
        let divFolder = spanRename.parentNode;
        let divName = divFolder.querySelector("[purpose='name']");
        let oldName = divName.innerHTML;

        if (nrname == oldName) {
            alert("Please enter a new name!");
            return;
        }
        // unique name validation
        let alreadyExist = resources.some(r => r.rname == nrname && r.pid == cfid);
        if (alreadyExist) {     
            alert("Folder named {" + nrname + "} already exists.Please enter a unique name!");
            return;
        }
        
        // change html
        divName.innerHTML = nrname;

        // change ram
        let ridToBeEdited = parseInt(divFolder.getAttribute("rid"));
        let resource = resources.find(r => r.id == ridToBeEdited);
        resource.rname = nrname;

        // change storage
        saveToStorage();
    }

    function renameTextFile() {
        let nrname = prompt("Enter New Text File Name ");
        if (nrname != null) {
            nrname = nrname.trim(); 
        }

        // empty name validation
        if (!nrname) {   
            alert("Text File's Name can not be empty! ");
            return;
        }
        // old name validation
        let spanRename = this;
        let divTextFile = spanRename.parentNode;
        let divName = divTextFile.querySelector("[purpose='name']");
        let oldName = divName.innerHTML;

        if (nrname == oldName) {
            alert("Please enter a new name!");
            return;
        }
        // unique name validation
        let alreadyExist = resources.some(r => r.rname == nrname && r.pid == cfid);
        if (alreadyExist) {     
            alert("Text File named {" + nrname + "} already exists.Please enter a unique name!");
            return;
        }
        
        // change html
        divName.innerHTML = nrname;

        // change ram
        let ridToBeEdited = parseInt(divTextFile.getAttribute("rid"));
        let resource = resources.find(r => r.id == ridToBeEdited);
        resource.rname = nrname;

        // change storage
        saveToStorage();
    }

    function viewFolder() {
        let spanView = this;
        let divFolder = this.parentNode;
        let divName = divFolder.querySelector("[purpose='name']");

        let fname = divName.innerHTML;
        let fid = parseInt(divFolder.getAttribute("rid"));

        let aPathTemplate = templates.content.querySelector("a[purpose='path']");
        let aPath = document.importNode(aPathTemplate, true);

        aPath.innerHTML = " > " + fname;
        aPath.setAttribute("rid", fid);
        aPath.addEventListener("click", viewFolderFromBreadcrumb);
        breadCrumb.appendChild(aPath);
        
        cfid = fid;
        // add folders to html
        container.innerHTML = "";
            // neeche ka code load from storage se copied
        for (let i = 0; i < resources.length; i++) {
            if (resources[i].pid == cfid) {
                if (resources[i].rtype == "folder") {
                    addFolderHTML(resources[i].rname, resources[i].id, cfid);
                } else if (resources[i].rtype == "text-file") {
                    addTextFileToHTML(resources[i].rname, resources[i].id, cfid)
                }
            }
            if (resources[i].id > rid) {
                rid = resources[i].id;
            }
        }

    } 

    function viewTextFile () {
        let spanView = this;
        let divTextFile = this.parentNode;
        let divName = divTextFile.querySelector("[purpose='name']");

        let fname = divName.innerHTML;
        let fid = parseInt(divTextFile.getAttribute("rid"));

        // template nikaal ke menu me append
        let notepadMenuTemplate = templates.content.querySelector("[purpose='notepad-menu']");
        let notepadMenu = document.importNode(notepadMenuTemplate, true);
        divAppMenuBar.innerHTML = "";
        divAppMenuBar.appendChild(notepadMenu);

        // template nikaal ke body me append
        let notepadBodyTemplate = templates.content.querySelector("[purpose='notepad-body']");
        let notepadBody = document.importNode(notepadBodyTemplate, true);
        divAppBody.innerHTML = "";
        divAppBody.appendChild(notepadBody);

        divAppTitle.innerHTML = fname;
        divAppTitle.setAttribute("rid", fid);


        // menu ke buttons ko nikaala and unpe event listener lagaya
        let spanSave = divAppMenuBar.querySelector("[action='save']");
        let spanBold = divAppMenuBar.querySelector("[action='bold']");
        let spanItalic = divAppMenuBar.querySelector("[action='italic']");
        let spanUnderline = divAppMenuBar.querySelector("[action='underline']");
        let inputBGcolor = divAppMenuBar.querySelector("[action='bg-color']");
        let inputTextColor = divAppMenuBar.querySelector("[action='fg-color']");
        let selectFontFamily = divAppMenuBar.querySelector("[action='font-family']");
        let selectFontSize = divAppMenuBar.querySelector("[action='font-size']");
        let spanDownload = divAppMenuBar.querySelector("[action='download']");
        let inputUpload = divAppMenuBar.querySelector("[action='upload']");
        let textArea = divAppBody.querySelector("textarea");

        spanSave.addEventListener("click", saveNotepad);
        spanBold.addEventListener("click", makeNotepadBold);
        spanItalic.addEventListener("click", makeNotepadItalic);
        spanUnderline.addEventListener("click", makeNotepadUnderline);
        inputBGcolor.addEventListener("change", changeNotepadBGcolor);
        inputTextColor.addEventListener("change", changeNotepadTextColor);
        selectFontFamily.addEventListener("change", changeNotepadFontFamily);
        selectFontSize.addEventListener("change", changeNotepadFontSize);
        spanDownload.addEventListener("click", downloadNotepad);
        inputUpload.addEventListener("change", uploadNotepad);

        // code from here
        let resource = resources.find(r => r.id == fid);
        spanBold.setAttribute("pressed", !resource.isBold);
        spanItalic.setAttribute("pressed", !resource.isItalic);
        spanUnderline.setAttribute("pressed", !resource.isUnderline);
        inputBGcolor.value = resource.BGcolor;
        inputTextColor.value = resource.textColor;
        selectFontFamily.value = resource.fontFamily;
        selectFontSize.value = resource.fontSize;
        textArea.value = resource.content;

        spanBold.dispatchEvent(new Event("click"));
        spanItalic.dispatchEvent(new Event("click"));
        spanUnderline.dispatchEvent(new Event("click"));
        inputBGcolor.dispatchEvent(new Event("change"));
        inputTextColor.dispatchEvent(new Event("change"));
        selectFontFamily.dispatchEvent(new Event("change"));
        selectFontSize.dispatchEvent(new Event("change"));
 
    }

    function downloadNotepad() {
        // save before downloading
        saveNotepad();

        let fid = parseInt(divAppTitle.getAttribute("rid"));
        let resource = resources.find(r => r.id == fid);
        let divNotepadMenu = this.parentNode;
        
        let strForDownload = JSON.stringify(resource);
        let encodedData = encodeURIComponent(strForDownload);
        
        let aDownload = divNotepadMenu.querySelector("[purpose = 'download']");
        aDownload.setAttribute("href", "data:text/json; charset=utf-8, " + encodedData);
        aDownload.setAttribute("download", resource.rname + ".json");

        aDownload.click();
    } 

    function uploadNotepad() {
        let file = window.event.target.files[0];
        
        let reader = new FileReader();

        // pehle load pe event lagaya aur then read kia jisse jab read krle poora to load
        // fire ho jaye. Agar read pehle krlete to read pehle krleta aur load fire ho jata
        // but ab tak code ki lines waha tak nahi pauchi hogi jaha load pe eventListener lgaya
        reader.addEventListener("load", function() {
            let data = window.event.target.result;
            let resource = JSON.parse(data);

            // veiw waale se churaya code and paste (resource se nikaal k notepad ki cheeze setup)
            
            let spanBold = divAppMenuBar.querySelector("[action='bold']");
            let spanItalic = divAppMenuBar.querySelector("[action='italic']");
            let spanUnderline = divAppMenuBar.querySelector("[action='underline']");
            let inputBGcolor = divAppMenuBar.querySelector("[action='bg-color']");
            let inputTextColor = divAppMenuBar.querySelector("[action='fg-color']");
            let selectFontFamily = divAppMenuBar.querySelector("[action='font-family']");
            let selectFontSize = divAppMenuBar.querySelector("[action='font-size']");
            let textArea = divAppBody.querySelector("textarea");

            spanBold.setAttribute("pressed", !resource.isBold);
            spanItalic.setAttribute("pressed", !resource.isItalic);
            spanUnderline.setAttribute("pressed", !resource.isUnderline);
            inputBGcolor.value = resource.BGcolor;
            inputTextColor.value = resource.textColor;
            selectFontFamily.value = resource.fontFamily;
            selectFontSize.value = resource.fontSize;
            textArea.value = resource.content;

            spanBold.dispatchEvent(new Event("click"));
            spanItalic.dispatchEvent(new Event("click"));
            spanUnderline.dispatchEvent(new Event("click"));
            inputBGcolor.dispatchEvent(new Event("change"));
            inputTextColor.dispatchEvent(new Event("change"));
            selectFontFamily.dispatchEvent(new Event("change"));
            selectFontSize.dispatchEvent(new Event("change"));
        })
        reader.readAsText(file);
    }

    function saveNotepad() {
        // code from here
        let fid = parseInt(divAppTitle.getAttribute("rid"));
        let resource = resources.find(r => r.id == fid);

        let spanBold = divAppMenuBar.querySelector("[action='bold']");
        let spanItalic = divAppMenuBar.querySelector("[action='italic']");
        let spanUnderline = divAppMenuBar.querySelector("[action='underline']");
        let inputBGcolor = divAppMenuBar.querySelector("[action='bg-color']");
        let inputTextColor = divAppMenuBar.querySelector("[action='fg-color']");
        let selectFontFamily = divAppMenuBar.querySelector("[action='font-family']");
        let selectFontSize = divAppMenuBar.querySelector("[action='font-size']");
        let textArea = divAppBody.querySelector("textarea");

        resource.isBold = spanBold.getAttribute("pressed") == "true";
        resource.isItalic = spanItalic.getAttribute("pressed") == "true";
        resource.isUnderline = spanUnderline.getAttribute("pressed") == "true";
        resource.BGcolor = inputBGcolor.value;
        resource.textColor = inputTextColor.value;
        resource.fontFamily = selectFontFamily.value;
        resource.fontSize = selectFontSize.value;
        resource.content = textArea.value;

        saveToStorage();

    }

    function makeNotepadBold() {
        let textArea = divAppBody.querySelector("textarea");
        let isPressed = this.getAttribute("pressed") == "true";

        if (isPressed == false) {
            this.setAttribute("pressed", true);
            textArea.style.fontWeight = "bold";
        } else {
            this.setAttribute("pressed", false);
            textArea.style.fontWeight = "normal";
        }
    }

    function makeNotepadItalic() {
        let textArea = divAppBody.querySelector("textarea");
        let isPressed = this.getAttribute("pressed") == "true";

        if (isPressed == false) {
            this.setAttribute("pressed", true);
            textArea.style.fontStyle = "italic";
        } else {
            this.setAttribute("pressed", false);
            textArea.style.fontStyle = "normal";
        }
    }

    function makeNotepadUnderline() {
        let textArea = divAppBody.querySelector("textarea");
        let isPressed = this.getAttribute("pressed") == "true";

        if (isPressed == false) {
            this.setAttribute("pressed", true);
            textArea.style.textDecoration = "underline";
        } else {
            this.setAttribute("pressed", false);
            textArea.style.textDecoration = "none";
        }
    }

    function changeNotepadBGcolor() {
        let color = this.value;
        let textArea = divAppBody.querySelector("textarea");
        textArea.style.backgroundColor = color;
    }

    function changeNotepadTextColor() {
        let color = this.value;
        let textArea = divAppBody.querySelector("textarea");
        textArea.style.color = color;
    }

    function changeNotepadFontFamily() {
        let fontFamily = this.value;
        let textArea = divAppBody.querySelector("textarea");
        textArea.style.fontFamily = fontFamily;
    }

    function changeNotepadFontSize() {
        let fontSize = this.value;
        let textArea = divAppBody.querySelector("textarea");
        textArea.style.fontSize = fontSize;
    }

    function viewFolderFromBreadcrumb () {
        let aPath = this;
        let fid = parseInt(aPath.getAttribute("rid"));

        // set the breadcrumb
        while (aPath.nextSibling) {
            aPath.parentNode.removeChild(aPath.nextSibling);
        }

        // set the container
        cfid = fid;
        container.innerHTML = "";
        // neeche ka code load from storage se copied
        for (let i = 0; i < resources.length; i++) {
            if (resources[i].pid == cfid) {
                if (resources[i].rtype == "folder") {
                    addFolderHTML(resources[i].rname, resources[i].id, cfid);
                } else if (resources[i].rtype == "text-file") {
                    addTextFileToHTML(resources[i].rname, resources[i].id, cfid)
                }
            }
            if (resources[i].id > rid) {
                rid = resources[i].id;
            }
        }

    }

    function saveToStorage() {
        let rjson = JSON.stringify(resources);
        localStorage.setItem("data", rjson);
    }

    function loadFromStorage() {
        let rjson = localStorage.getItem("data");
                
        if (!rjson) {
            return;
        } 
        resources = JSON.parse(rjson);
        for (let i = 0; i < resources.length; i++) {
            if (resources[i].pid == cfid) {
                if (resources[i].rtype == "folder") {
                    addFolderHTML(resources[i].rname, resources[i].id, cfid);
                } else if (resources[i].rtype == "text-file") {
                    addTextFileToHTML(resources[i].rname, resources[i].id, cfid)
                }
            }
            if (resources[i].id > rid) {
                rid = resources[i].id;
            }
        }
         
    }

    loadFromStorage();

})();