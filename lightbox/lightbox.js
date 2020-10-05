    //************************************************************************
    // MIT License
    // Copyright (c) 2020 Nate Fazakerly 
    //************************************************************************
    
    //************************************************************************
    //  USER OPTIONS
    const options = {
        'filePath' : "../lightbox/", // directory path to your lightbox files
        'captions': false, // enable/disable captions*
        // * use captions.xml to edit captions
        'filters' : true, // enable/disable category filters
        'loadTime': 1000, // in milliseconds - minimum time period loader boxes 
        // are shown
        'rollover': "zoom", //thumbnail hover animations*
        //* zoom, slide, drop, or none.
        'slider': "slide" //lightbox slider animation*
        //* zoom, slide, or none.               
    }

    Object.freeze(options);

    const { filePath, captions, filters, loadTime, rollover, slider } = options;

    //************************************************************************

    var resizeDone, captionsLoaded = false, imgCount;
    var notLoaded = true, nav = false;
    var type = "all"; //for thumb sorting

    window.addEventListener('resize', () => {
        clearTimeout(resizeDone),
            resizeDone = setTimeout(() => {
                //check if element is visible
                if (window.getComputedStyle(document.querySelector(".lightbox")).getPropertyValue("display") != "none" ){
                    setNav();
                };
            }, 50);
    });

    //************************************************************************
    //          BACK TO TOP 
    //************************************************************************

    window.addEventListener('scroll', () => {
        checkTop();
    });

    checkTop = () => {
        let pos = window.scrollY;
        let top = document.getElementById('top');
        if (pos >= 900){
            top.style.display = 'block';
            top.addEventListener('click', () => {
                window.scrollTo(0, 0);
            });
        }
        else {
            top.style.display = 'none';
        }
    }
    
    checkTop();

    //************************************************************************
    //          Sorting Directories
    //************************************************************************

    //hide filters if needed
    if (!filters) {
        let sorts = document.querySelector('.sorting');
        if ( sorts !== null){
            sorts.style.display = 'none';
        }
        //var dirs = null;
    }
    else { //filters
        var sorts = Array.from(document.querySelectorAll('.sorting ul li a'));
        var dirs = [];
        sorts.forEach((element) => {
            if(element.innerHTML !== 'all'){
                dirs.push(element.innerHTML)
            } 
        });
    }

    //************************************************************************
    //          Load captions from captions.json ...
    //************************************************************************

    if(captions){
        //SHOW CAPTIONS LOADER...
        document.querySelector('.loader-captions').style.display = 'block';
        let xhr = new XMLHttpRequest();
        if(filters){
            xhr.open('GET', filePath + 'captions.php?dirs=' + dirs);
        }
        else {
            xhr.open('GET', filePath + 'captions.php?');
        }
        xhr.send();
        xhr.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                captionsLoaded = true;
            }
        };
    };

    //************************************************************************
    //          FORM IMAGE ARRAY FROM /fullsize/ FOLDER IMAGES
    //************************************************************************
    
    let getImages = (e) => {
        let xhr = new XMLHttpRequest();
        if(filters){
            xhr.open('GET', filePath + 'full.php?filePath=' + filePath + '&type=' + type + '&dirs=' + dirs);
        }
        else { //no filters
            xhr.open('GET', filePath + 'full.php?filePath=' + filePath + '&type=' + type);
        }
        xhr.send(); 
        xhr.onreadystatechange = function(e){
            if (this.readyState == 4 && this.status == 200) {
                imgArray = JSON.parse(e.currentTarget.response);
                imgCount = imgArray.length;
                for (x = 0; x <= imgCount - 1; x++) {
                    //load dummy images into relative gallery div
                    let gal = document.querySelector('#gallery');
                    gal.insertAdjacentHTML('beforeend', '<div class="loader"><img src="' + filePath + '/images/image-dummy.png" class="fadeRight" alt=""/></div>');
                };
                loadThumbs(type);
            }
        };
    }

    getImages();

    //************************************************************************
    //          LOAD THUMBNAIL GALLERY
    //************************************************************************

    loadThumbs = (type) => {
        notLoaded = true; //disallow sorting until thumbs are loaded...
        //CLEAR FOR SORTING...
        if(filters){
            const warn = document.querySelector('.warn');
            if( warn !== null){
                warn.innerHTML = '';
            }
        }
        const thms = document.querySelectorAll('.thumb');
        if (thms.length > 0){
            let nodes = Array.from(thms);
            nodes.forEach((element) => {
                element.parentNode.removeChild(element);
            });
        };
        //hide captions loader if visible
        if (window.getComputedStyle(document.querySelector(".loader-captions")).getPropertyValue("display") != "none" ){
            document.querySelector('.loader-captions').setAttribute('style', 'display:none');
        };
        try {
            let xhr = new XMLHttpRequest();
            xhr.open('POST', filePath + 'thumbs.php', true);
            xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            if (filters){
                xhr.send('filePath=' + filePath + '&imgCount=' + imgCount + '&fArray=' + imgArray + '&type=' + type + '&dirs=' + dirs); 
            }
            else {
                xhr.send('filePath=' + filePath + '&imgCount=' + imgCount + '&fArray=' + imgArray + '&type=' + type); 
            }

            xhr.onreadystatechange = function(e){
                if (this.readyState == 4 && this.status == 200) {
                    thumbArray = JSON.parse(e.currentTarget.response);
                    let gal = document.getElementById('gallery');
                    for (x = 0; x <= thumbArray.length - 1; x++) {
                        gal.insertAdjacentHTML('beforeEnd', '<div class="thumb"><a href="#"><img src="' + thumbArray[x] + '" /></a></div>');
                    };
                    let thumbs = document.querySelectorAll(".thumb img");
                    // wait until last thumb is loaded...
                    let lastThumb; 
                    thumbs.forEach((el, index) => {
                        if(index == thumbs.length - 1){
                            lastThumb = thumbs[thumbs.length - 1];
                        };
                    });
                    if(typeof lastThumb === "undefined"){
                        if(filters){
                            let warn = document.querySelector('.warn');
                            console.log(typeof warn);
                            if (warn !== null) {
                                warn.insertAdjacentHTML("beforeend", '<h3>Doesn&#39;t look like we have any images in the ' + type + '. category!</h3>');
                            }
                            else {
                                console.log('Doesnt look like we have any images in the ' + type + '. category.')
                            }
                        }
                        const ldr = document.querySelectorAll('.loader');
                        if (ldr.length > 0){
                            let nodes = Array.from(ldr);
                            nodes.forEach((element) => {
                                element.parentNode.removeChild(element);
                            });
                        };
                        //RE-ENABLE SORTING CURSORS:
                        if(filters){
                            for(let el of sorts){
                                el.setAttribute('style', 'cursor:pointer; opacity:1;')
                            }
                        }
                        notLoaded = false;
                        return;
                    };
                    //************************************
                    lastThumb.addEventListener("load", () => {
                        //********************************************
                        //          VERTICAL/BIG THUMB HANDLING 
                        //********************************************
                        for(let i of thumbs){
                            let real_width = i.naturalWidth;
                            let real_height = i.naturalHeight;
                            if (real_height > real_width) {
                                i.closest('div').classList.add("vertical");
                            };
                        };
                        //**************************************************   
                        //*** GET HEIGHT OF GALLERY */
                        let h = gal.clientHeight;
                        //**************************************************
                        setTimeout(function () { //show loaders
                            let thumbs = document.querySelectorAll(".thumb");
                            thumbs.forEach((element) => {
                                element.style.display = 'block';
                                element.classList.add("fadein");
                            });
                            let loaders = document.querySelectorAll('.loader');
                            loaders.forEach((element) => {
                                element.remove();
                            });
                            //set gallery height ...
                            gal.setAttribute('style', 'min-height:' + h + 'px');
                            //after loaders are gone, reset gallery height to auto, set cursors, etc ...    
                            gal.setAttribute('style', 'height:auto');
                            //RE-ENABLE SORTING CURSORS:
                            if(filters){
                                for(let el of sorts){
                                    el.setAttribute('style', 'cursor:pointer; opacity:1;')
                                }
                            }
                            notLoaded = false;  //enable gallery/sorting click event
                            //********************************************
                            //          THUMBNAIL ROLLOVERS 
                            //********************************************
                            let imgs = document.querySelectorAll('.thumb img');
                            imgs.forEach(element => {
                                element.addEventListener("mouseenter", (event) => {
                                    if (rollover == "zoom") {
                                        event.target.classList.add('thumb-zoom');
                                    }
                                    else if (rollover == "slide") {
                                        event.target.classList.add('thumb-slide');
                                    }
                                    else if (rollover == "drop") {
                                        event.target.classList.add('thumb-drop');
                                    }
                                });
                                element.addEventListener("mouseleave", (event) => {
                                    if (rollover == "zoom") {
                                        event.target.classList.remove('thumb-zoom');
                                    }
                                    else if (rollover == "slide") {
                                        event.target.classList.remove('thumb-slide');
                                    }
                                    else if (rollover == "drop") {
                                        event.target.classList.remove('thumb-drop');
                                    } 
                                });                 
                            });
                        }, loadTime);
                    });
                };
            };
        } catch (err) {
            alert("something went wrong:  " + err.message);
            return;
        };
    };

    //************************************************************************
    //          SORTING
    //************************************************************************

    if (filters){
        let sort = document.querySelector('.sorting');
        if (sort === null){
            console.log('The sorting div element is missing...did you delete from the index.html?')
        }
        else{ //sort valid
            sort.addEventListener('click', (e) => {
                // if target is not a sorting A tag or thumbs not loaded, get out of callback. 
                if(e.target.tagName !== 'A' || notLoaded){
                    return;
                }
                let sortLinks = sort.getElementsByTagName("a");
                for (let el of sortLinks){
                    //DISABLE SORTING CURSORS during load:
                    el.setAttribute('style', 'cursor:wait; opacity:0.3;')
                    el.classList.remove('active');
                    if (e.target == el){
                        sorting = true;
                        type = el.innerHTML;
                        //set active state:
                        el.classList.add('active');
                    }
                }
                if(sorting) {
                    getImages();
                        return;
                };
            });
        }
    }
    
    //************************************************************************
    //          SHOW INITIAL IMAGE
    //************************************************************************
    var slowLoad = false;
    let gal = document.getElementById('gallery');
    gal.addEventListener('click', (e) => {
        let target = e.target;

        //************************************************************************
        // if target is not a thumbnail img or sorting link, get out to avoid typeError.
        if(target.tagName !== 'IMG'){
            return;
        }
        if(notLoaded){ //enable only after all thumbs loaded...
            return;
        }
        let loadTest = setTimeout(() => { //check for slow image load time
            slowLoad = true;
        }, 100);
        //*********************************************
        //get current scroll position of window and set top of lightbox later
        pos = window.scrollY;
        //*********************************************
        //bug hack...
        document.getElementById('container').setAttribute("style", "display:none"); //hides bug in jquery where page scrolls to top for some reason on image load
        //*********************************************
        let match;
        let div = document.querySelector('.lightbox'); 
        let ldr = document.querySelector('.loader-img');
        let captiondiv = document.querySelector('.caption');
        let srcc = target.getAttribute("src"); 
        let clickedImg = srcc.replace('/thumbs', '/fullsize');
        //Show lightbox but only loader for now until img loads ...
        //************************************************** 
        div.setAttribute('style', 'display:inline-grid');
        div.classList.add('fadein');
        let descLtbx = div.getElementsByTagName('*');
        let arrdescLtbx = Array.prototype.slice.call(descLtbx);
        for(elem of arrdescLtbx){
            if(elem !== ldr){
                elem.setAttribute('style', 'display:none');
            }
        }
        //************************************************** 
        try {
            for (x=0; x<imgArray.length; x++) { 
                if (imgArray[x] == clickedImg) {
                    match = true;
                    // set lightbox image source to the fullsize image:
                    let img = document.querySelector('.lightbox img');
                    img.src = imgArray[x];
                    img.onload = () => {
                        //reshow all lightbox elems but hide loader ...
                        //& HIDE CAPTION IF NO CAPTIONS...
                        //************************************************** 
                        clearTimeout(loadTest); //don't set slowLoad if image already loaded
                        for(elem of arrdescLtbx){                           
                            if(elem !== ldr){
                                elem.setAttribute('style', 'display:block;');
                            }                
                            if(!captions){
                                if(elem === captiondiv){
                                    elem.setAttribute('style', 'display:none;');
                                }
                            }                  
                        }
                        //**************************************************
                        if(!slowLoad){ //hide loader if normal connection...
                            ldr.setAttribute('style', 'display:none');
                        } 
                        //**************************************************
                        document.body.setAttribute('style', 'overflow:hidden');
                        setTimeout(() => {
                            //**************************************
                            //bug hack - fade back in...  
                            document.getElementById('container').setAttribute("style", "display:block");
                            //scroll to position ********************
                            window.scrollTo(0, pos);
                            //***************************************
                        }, 50);
                        // fade in image then remove class
                        if(slider == "slide"){
                            img.className = "slideLeft";
                            setTimeout(function() {
                                img.classList.remove('slideLeft');
                            }, 400);
                        }
                        else if (slider == "zoom"){
                            img.className = "zoomOut";
                            setTimeout(function() {
                                img.classList.remove('zoomOut');
                            }, 400);
                        }
                        else {
                            img.className = "fadeIn";
                            setTimeout(function() {
                                img.classList.remove('fadein');
                            }, 400);
                        }
                        //********************************************
                        //          SET NAVIGATION POSITION
                        //********************************************
                        setNav();
                    };
                    //SHOW CAPTION ******************************
                    let $index = x;
                    if(captions){
                        if (captionsLoaded) {
                            nav = false;
                            loadCaptions($index);
                        }
                        else { //captionsLoaded is false so something went wrong
                            console.log('There was a problem loading the captions. Try clearing the browser cache and refreshing.')
                        };
                    }
                    //*******************************************
                    break;
                }
                {
                    match = false;
                };
            };
            if (!match) {
                alert("Couldn't find a matching image.");
                let ldrimg = document.querySelector(".loader-img");
                if (window.getComputedStyle(ldrimg).getPropertyValue("display") != "none" ){
                    ldrimg.setAttribute('style', 'display:none');
                };
                let ctnr = document.getElementById("container");
                if (window.getComputedStyle(ctnr).getPropertyValue("display") === "none" ){
                    ctnr.setAttribute('style', 'display:block');
                    ctnr.classList.add('fadein');
                };
                return;
            };
        }
        catch (err) {
            alert(err.message);
            return;
        };
    });

    //************************************************************************
    //          LOAD CAPTIONS   
    //************************************************************************

    let loadCaptions = ($index) => {
        //the captions.json has been created or gotten...
        let xhr = new XMLHttpRequest();
        xhr.open('GET', filePath + 'captions.json');
        xhr.send();
        xhr.onload = function(e) {
            if (this.readyState == 4 && this.status == 200) {
                let foo = JSON.parse(e.currentTarget.response);
                let captiondiv = document.querySelector('.caption');
                if(type != 'all'){ // sorting so...
                    for (const [key, value] of Object.entries(foo)) {
                        if(key === type){ //years match
                            if(nav){ //prev/next
                                if(p){
                                    $index = intPrev;
                                }
                                else if (n) {
                                    $index = intNext;
                                }
                            }     
                            Object.values(value).forEach((item, index) => {
                                if( index === $index ){ //captions match image
                                    let $caption = Object.values(item);
                                    captiondiv.innerHTML = ''; 
                                    captiondiv.insertAdjacentHTML('beforeend', '<p>' + $caption + '</p>');
                                }
                            }); 
                        }
                    }
                }
                else { // ALL category OR no filters
                    if(nav){ //prev/next
                        if(p){
                            $index = intPrev;
                        }
                        else if (n) {
                            $index = intNext;
                        }
                    }                    
                    let x = -1;
                    for (const [key, value] of Object.entries(foo)) {
                        for(const item of Object.values(value)) {
                            x++; //tracks each caption object without resetting on year
                            let $caption;
                            if( x === $index ){ //captions match image
                                if(filters){
                                    $caption = Object.values(item);
                                }
                                else { //no filters
                                    if(typeof(item) === 'object'){
                                        $caption = Object.values(item);
                                    }
                                    else{ //string (user nds to change captions format)
                                        $caption = item;
                                    }
                                }
                                captiondiv.innerHTML = '';
                                captiondiv.insertAdjacentHTML('beforeend', '<p>' + $caption + '</p>');
                                break;
                            }
                        }  
                    }
                }
            }
        }
    }

    //************************************************************************
    //          CLOSING THE IMAGE
    //************************************************************************
    document.addEventListener('mouseup', (e) => { //check if clicking off photo in order to close it
        let ltbx = document.querySelector('.lightbox');
        if(window.getComputedStyle(ltbx).getPropertyValue('display') != 'none' ){ // if lightbox is visible ...
            let elems = document.querySelector('.lightbox');
            let desc = elems.getElementsByTagName('*');
            let descendants = Array.prototype.slice.call(desc);
            for(elem of descendants) { //check if target is lightbox or descendant, & if so then DON'T close the lightbox photo
                if(elem == e.target){
                    var dontclose = true;
                }
            };
            if(!dontclose){
                closePhoto();
                dontclose = true;
            };
        };
    });


    closePhoto = () => {
        window.scrollTo(0, pos); 
        let img = document.querySelector('.lightbox img');
        img.src = '';    
        document.querySelector('.lightbox').setAttribute('style', 'display:none')
        document.body.setAttribute('style', 'overflow:visible')
    };

    //************************************************************************
    //          NAVIGATION
    //************************************************************************

    // HANDLE NAVIGATION BUTTONS & CLOSE    
    setNav = () => {
        let w = window.innerWidth - 25;
        let lnav = document.querySelector('.lightbox-nav');
        let close = document.querySelector('.closeP');
        lnav.setAttribute('style', 'display:block; margin-left:' + -w/2 + 'px; width:' + w + 'px' );
        close.setAttribute('style', 'display:block; margin-left:' + -w/2 + 'px; width:' + w + 'px' );
    };

    //ADD NAVIGATION LISTENERS...P
    let ltbx = document.querySelector('.lightbox');
    ltbx.onclick = (e) => {
        let prev = document.querySelector('.nav-prev-photo');
        let next = document.querySelector('.nav-next-photo');
        let close = document.querySelector('.closeP');
        let descPrev = prev.children.item(0); //the target is always the single child (i.material-icons...)
        let descNext = next.children.item(0);
        let descClose = close.getElementsByTagName('*');
        let arrdescClose = Array.prototype.slice.call(descClose);
        for(elem of arrdescClose) { //check if target is lightbox or descendant, & if so then DON'T close the lightbox photo
            if(elem == e.target){
                closePhoto();
            }
        };
        if(descPrev == e.target){
            getPrevNxt(p = true, n = false); 
        }
        if(descNext == e.target){
            getPrevNxt(p = false, n = true); 
        }
    };

    getPrevNxt = () => {
        let currentImg = document.querySelector('.lightbox img').getAttribute('src');
        let match;
        for (var x = 0; x <= imgArray.length - 1; x++) {
            if (currentImg == imgArray[x]) {
                match = true;
            }
            if (match) {
                if (x == 0) {
                    navLinks(intPrev = imgArray.length - 1, intNext = x + 1, p, n);
                    return;
                }
                else if (x == imgArray.length - 1) {
                    navLinks(intPrev = x - 1, intNext = 0, p, n);
                    return;
                }
                {
                    navLinks(intPrev = x - 1, intNext = x + 1, p, n);
                    return;
                }
            }
        }
    }

    // SET UP PREV/NEXT IMAGE
    navLinks = () => {
        let ldr = document.querySelector('.loader-img');
        let div = document.querySelector('.lightbox');
        let img = div.querySelector(".lightbox img");
        let captiondiv = document.querySelector('.caption');
        //Hide all lightbox descendants except loader (if slowLoad) ...
        //************************************************** 
        let descLtbx = div.getElementsByTagName('*');
        let arrdescLtbx = Array.prototype.slice.call(descLtbx);
        //show loader if first image loaded slowly (slow connection)
        if(slowLoad){
            for(elem of arrdescLtbx){
                if(elem !== ldr){
                    elem.setAttribute('style', 'display:none');
                }
            }
        }
        //************************************************** 
        try {
            if (p) {
                img.innerHTML = '';
                img.src = imgArray[intPrev];
            }
            else if (n) {
                img.innerHTML = '';
                img.src = imgArray[intNext];
            }
            img.onload = prevNext = () => {
            //reshow all lightbox elems but hide loader ...
            //************************************************** 
            for(elem of arrdescLtbx){                           
                if(elem !== ldr){
                    elem.setAttribute('style', 'display:block;');
                }                
                if(!captions){
                    if(elem === captiondiv){
                        elem.setAttribute('style', 'display:none;');
                    }
                }                  
            }
            //************************************************** 
                //********************************************
                //          SLIDER ANIMATION 
                //********************************************
                if (slider == "slide") {
                    if (p){
                        img.className = 'slideRight';
                        setTimeout(function(){
                            img.classList.remove('slideRight');
                        }, 400);
                    }
                    else if(n){
                        img.className = 'slideLeft';
                        setTimeout(function(){
                            img.classList.remove('slideLeft');
                        }, 400);
                    }
                }
                else if (slider == "zoom") {
                    img.className = 'zoomOut';
                    setTimeout(function(){
                        img.classList.remove('zoomOut');
                    }, 400);
                }
                //********************************************
                //          SET NAVIGATION/CLOSE POSITION
                //********************************************
                setNav();
                //********************************************
                //SHOW CAPTION ******************************
                if (captions){
                    if (captionsLoaded) {
                        nav = true;
                        loadCaptions();
                    }
                    else { //captionsLoaded is false so something went wrong
                        console.log('There was a problem loading the captions. Try clearing the browser cache and refreshing.')
                    };
                }
            };
        } catch (err) {
            alert(err.message);
            return;
        }
    }

    //KEYS...

    document.addEventListener('keydown', (e) => {
        let close = document.querySelector('.closeP');
        if(window.getComputedStyle(close).getPropertyValue('display') != "none"){
            if (e.key === "ArrowLeft") {
                getPrevNxt(p = true, n = false);
            }
            if (e.key === "ArrowRight") {
                getPrevNxt(p = false, n = true);
            }
            if (e.key === "Escape") { // escape key maps to keycode `27`
                closePhoto();
            }
        }
    });

    //************************************************************************
    //          TOUCH/SWIPE EVENTS
    //************************************************************************
    let initialX = null, currentX = null, initialY = null, currentY = null, zooming = false;

    let lightbx = document.querySelector('.lightbox'); //should be lightbox and all children (incl lightbox-nav etc)...
    lightbx.addEventListener('touchstart', (e) => {
        initialX = e.touches[0].screenX;
        initialY = e.touches[0].screenY;
        zooming = false;
    });

    lightbx.addEventListener('touchmove', (e) => { 
        let $div = document.querySelector('.lightbox img');
        if (e.touches.length > 1) {
            zooming = true; //2 fingers
        }

        if($div.classList.contains("slideRight")){
            $div.classList.remove("slideRight");
        }
        else if($div.classList.contains("slideLeft")){
            $div.classList.remove("slideLeft");
        }

        let currentX = e.touches[0].screenX;
        let currentY = e.touches[0].screenY;

        let diffX = initialX - currentX;
        let diffY = initialY - currentY;

        if (Math.abs(diffX) > Math.abs(diffY)) { //sliding horizontally
            if (diffX > 0) {
                //swipe left
                $div.className = "swipeLeft";
            }
            else {
                //swipe right
                $div.className = "swipeRight";
            }
        }
    });

    lightbx.addEventListener('touchend', (e) => {
        let $div = document.querySelector('.lightbox img');
        let currentX = e.changedTouches[e.changedTouches.length - 1].screenX;
        let currentY = e.changedTouches[e.changedTouches.length - 1].screenY;
        //always remove the slider animation so it doesn't get stuck
        if ($div.classList.contains("swipeLeft")) {
            $div.classList.remove("swipeLeft");
        };
        if ($div.classList.contains("swipeRight")) {
            $div.classList.remove("swipeRight");
        };
        if (zooming) {
            return;
        };
        if (initialX === null || currentX === null) {
            return; //touch unsupported
        };

        let diffX = initialX - currentX;
        let diffY = initialY - currentY;

        if (Math.abs(diffX) > Math.abs(diffY)) { //sliding horizontally
            if (diffX > 35) {
                //swipe left
                getPrevNxt(p = false, n = true);
            }
            else if (diffX < -35) {
                //swipe right
                getPrevNxt(p = true, n = false);
            };
        }
        { //sliding vertically
            if ($div.classList.contains("swipeLeft")) {
                $div.classList.remove("swipeLeft");
            };
            if ($div.classList.contains("swipeRight")) {
                $div.classList.remove("swipeRight");
            };
            return;
        };
    });