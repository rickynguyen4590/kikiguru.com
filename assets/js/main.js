var html = $('html');
var body = $('body');

$(function () {
    idleLong(loadFb);
    idleLong(loadGG);
    darkMode();
    idle(carousel);
    idle(modal, 200);
    idle(search, 250);
    video();
    gallery();
    author();
    idle(offCanvas, 10);
    idle(highlight, 10);
});

function idle(cb, time) {
    time = time || 500 + Math.random() * 2500
    setTimeout(cb, time);
}

function idleLong(cb, time) {
    time = time || 1500 + Math.random() * 4000
    setTimeout(cb, time);
}


function loadFb() {
    const script = document.createElement('script');
    script.crossOrigin = "anonymous";
    script.async = true;
    script.nonce = "hRevMNbZ";
    script.src = "https://connect.facebook.net/vi_VN/sdk.js#xfbml=1&version=v9.0&appId=429146018231335";
    document.getElementsByTagName('head')[0].appendChild(script);
}

function loadGG() {
    const script = document.createElement('script');
    script.crossOrigin = "anonymous";
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=G-XZG88T09VQ";
    document.getElementsByTagName('head')[0].appendChild(script);

    <!-- Global site tag (gtag.js) - Google Analytics -->
    window.dataLayer = window.dataLayer || [];

    function gtag() {
        dataLayer.push(arguments);
    }

    gtag('js', new Date());
    gtag('config', 'G-XZG88T09VQ');
}

function highlight() {
    document.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightBlock(block);
        hljs.lineNumbersBlock(block);
    });
}


function modal() {
    'use strict';
    var modalOverlay = $('.modal-overlay');
    var modal = $('.modal');
    var modalInput = $('.modal-input');

    $('.js-modal').on('click', function (e) {
        e.preventDefault();
        modalOverlay.show().outerWidth();
        body.addClass('modal-opened');
        modalInput.focus();
    });

    $('.modal-close, .modal-overlay').on('click', function () {
        body.removeClass('modal-opened');
    });

    modal.on('click', function (e) {
        e.stopPropagation();
    });

    $(document).keyup(function (e) {
        if (e.keyCode === 27 && body.hasClass('modal-opened')) {
            body.removeClass('modal-opened');
        }
    });

    modalOverlay.on('transitionend', function (e) {
        if (!body.hasClass('modal-opened')) {
            modalOverlay.hide();
        }
    });

    modal.on('transitionend', function (e) {
        e.stopPropagation();
    });
}

function search() {
    'use strict';
    if (
        typeof gh_search_key == 'undefined' ||
        gh_search_key == '' ||
        typeof gh_search_migration == 'undefined'
    )
        return;

    var searchInput = $('.search-input');
    var searchButton = $('.search-button');
    var searchResult = $('.search-result');
    var popular = $('.popular-wrapper');
    var includeContent = typeof gh_search_content == 'undefined' || gh_search_content == true ? true : false;

    var url =
        siteUrl +
        '/ghost/api/v3/content/posts/?key=' +
        gh_search_key +
        '&limit=all&fields=id,title,url,updated_at,visibility&order=updated_at%20desc';
    url += includeContent ? '&formats=plaintext' : '';
    var indexDump = JSON.parse(localStorage.getItem('dawn_search_index'));
    var index;

    elasticlunr.clearStopWords();

    localStorage.removeItem('dawn_index');
    localStorage.removeItem('dawn_last');

    function update(data) {
        data.posts.forEach(function (post) {
            index.addDoc(post);
        });

        try {
            localStorage.setItem('dawn_search_index', JSON.stringify(index));
            localStorage.setItem('dawn_search_last', data.posts[0].updated_at);
        } catch (e) {
            console.error('Your browser local storage is full. Update your search settings following the instruction at https://github.com/TryGhost/Dawn#disable-content-search');
        }
    }

    if (
        !indexDump ||
        gh_search_migration != localStorage.getItem('dawn_search_migration')
    ) {
        $.get(url, function (data) {
            if (data.posts.length > 0) {
                index = elasticlunr(function () {
                    this.addField('title');
                    if (includeContent) {
                        this.addField('plaintext');
                    }
                    this.setRef('id');
                });

                update(data);

                localStorage.setItem(
                    'dawn_search_migration',
                    gh_search_migration
                );
            }
        });
    } else {
        index = elasticlunr.Index.load(indexDump);

        $.get(
            url +
            "&filter=updated_at:>'" +
            localStorage
                .getItem('dawn_search_last')
                .replace(/\..*/, '')
                .replace(/T/, ' ') +
            "'",
            function (data) {
                if (data.posts.length > 0) {
                    update(data);
                }
            }
        );
    }

    searchInput.on('keyup', function (e) {
        var result = index.search(e.target.value, {expand: true});
        var output = '';

        result.forEach(function (post) {
            output +=
                '<div class="search-result-row">' +
                '<a class="search-result-row-link" href="' +
                post.doc.url +
                '">' +
                post.doc.title +
                '</a>' +
                '</div>';
        });

        searchResult.html(output);

        if (e.target.value.length > 0) {
            searchButton.addClass('search-button-clear');
        } else {
            searchButton.removeClass('search-button-clear');
        }

        if (result.length > 0) {
            popular.hide();
        } else {
            popular.show();
        }
    });

    $('.search-form').on('submit', function (e) {
        e.preventDefault();
    });

    searchButton.on('click', function () {
        if ($(this).hasClass('search-button-clear')) {
            searchInput.val('').focus().keyup();
        }
    });
}

function darkMode() {
    $('.toggle-track').on('click', function () {
        if (html.hasClass('dark-mode')) {
            html.removeClass('dark-mode');
            localStorage.setItem('alto_dark', false);
        } else {
            html.addClass('dark-mode');
            localStorage.setItem('alto_dark', true);
        }
    });
}


function carousel() {
    var carousel = $('.carousel');
    var postImage = carousel.find('.post-image');
    var imageHeight, nav;

    function moveNav() {
        imageHeight = postImage.height();
        if (!nav) {
            nav = carousel.find('.owl-prev, .owl-next');
        }
        nav.css({
            top: imageHeight / 2 + 'px',
            opacity: 1,
        });
    }

    carousel.owlCarousel({
        dots: false,
        margin: 20,
        nav: true,
        navText: [
            '<i class="icon icon-chevron-left"></i>',
            '<i class="icon icon-chevron-right"></i>',
        ],
        onInitialized: function () {
            moveNav();
        },
        onResized: function () {
            moveNav();
        },
        responsive: {
            0: {
                items: 1,
            },
            768: {
                items: 3,
            },
            992: {
                items: 4,
            },
        },
    });
}

function video() {
    'use strict';
    $('.post-content').fitVids();
}

function gallery() {
    var images = document.querySelectorAll('.kg-gallery-image img');
    images.forEach(function (image) {
        var container = image.closest('.kg-gallery-image');
        var width = image.attributes.width.value;
        var height = image.attributes.height.value;
        var ratio = width / height;
        container.style.flex = ratio + ' 1 0%';
    });
}

function author() {
    $('.author-name').on('click', function () {
        $(this).next('.author-social').toggleClass('enabled');
    });
}

function offCanvas() {
    var burger = jQuery('.burger');
    var canvasClose = jQuery('.canvas-close');

    jQuery('.main-menu .nav-list').slicknav({
        label: '',
        prependTo: '.mobile-menu',
    });

    burger.on('click', function () {
        html.toggleClass('canvas-opened');
        html.addClass('canvas-visible');
        dimmer('open', 'medium');
    });

    canvasClose.on('click', function () {
        if (html.hasClass('canvas-opened')) {
            html.removeClass('canvas-opened');
            dimmer('close', 'medium');
        }
    });

    jQuery('.dimmer').on('click', function () {
        if (html.hasClass('canvas-opened')) {
            html.removeClass('canvas-opened');
            dimmer('close', 'medium');
        }
    });

    jQuery(document).keyup(function (e) {
        if (e.keyCode == 27 && html.hasClass('canvas-opened')) {
            html.removeClass('canvas-opened');
            dimmer('close', 'medium');
        }
    });
}

function dimmer(action, speed) {
    'use strict';

    var dimmer = jQuery('.dimmer');

    switch (action) {
        case 'open':
            dimmer.fadeIn(speed);
            break;
        case 'close':
            dimmer.fadeOut(speed);
            break;
    }
}
