/*
Template Name: Steex - Admin & Dashboard Template
Author: Themesbrand
Website: https://Themesbrand.com/
Contact: Themesbrand@gmail.com
File: Card init js
*/

const Portlet = function () {
    const el = document.querySelector('.card a[data-toggle="reload"]');
    if (el) {
        el.addEventListener("click", function (ev) {
            ev.preventDefault();
            const $portlet = el.closest(".card");
            const insertEl = `
                <div class="card-preloader">
                    <div class="card-status">
                        <div class="spinner-border text-success">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                    </div>
                </div>
            `;
            $portlet.children[1].insertAdjacentHTML("beforeend", insertEl);
            const $pd = $portlet.querySelector(".card-preloader");
            setTimeout(function () {
                if($pd)
                    $pd.remove();
            }, 500 + 300 * (Math.random() * 5));
        });
    }
};

Portlet();

var growingLoader = function () {
    var element = document.querySelector('.card a[data-toggle="growing-reload"]');
    if (element) {
        element.addEventListener("click", function (ev) {
            ev.preventDefault();
            var $portlet = element.closest(".card");
            insertEl = '<div class="card-preloader"><div class="card-status"><div class="spinner-grow text-danger"><span class="visually-hidden">Loading...</span></div></div></div>';
            $portlet.children[1].insertAdjacentHTML("beforeend", insertEl);
            var $pd = $portlet.getElementsByClassName("card-preloader")[0];
            setTimeout(function () {
                $pd.remove();
            }, 500 + 300 * (Math.random() * 5));
        });
    }
};
growingLoader();

var customLoader = function () {
    customLoader1 = document.querySelector('.card a[data-toggle="customer-loader"]');
    if (customLoader1) {
        customLoader1.addEventListener("click", function (elem) {
            elem.preventDefault();
            var $portlet = customLoader1.closest(".card");
            insertEl = '<div class="card-preloader"><div class="card-status"><img src="/static/images/logo-sm.png" alt="" class="img-fluid custom-loader"></div></div>';
            $portlet.children[1].insertAdjacentHTML("beforeend", insertEl);
            var $pd = $portlet.getElementsByClassName("card-preloader")[0];
            setTimeout(function () {
                $pd.remove();
            }, 500 + 300 * (Math.random() * 5));
        });
    }
};

customLoader();

//card-remove Js
function delthis(id) {
    document.getElementById(id).remove();
}