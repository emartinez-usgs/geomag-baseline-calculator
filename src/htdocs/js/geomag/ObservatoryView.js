/* global define, unescape */
define([
	'mvc/View',
	'util/Events',
	'util/Util',
	'geomag/ObservatoryFactory',
	'geomag/ObservationsView'
], function (
	View,
	Events,
	Util,
	ObservatoryFactory,
	ObservationsView
) {
	'use strict';


	var DEFAULTS = {
		observatoryId: null,
		factory: new ObservatoryFactory()
	};


	var ObservatoryView = function (options) {
		this._options = Util.extend({}, DEFAULTS, options);
		View.call(this, this._options);
	};

	ObservatoryView.prototype = Object.create(View.prototype);


	ObservatoryView.prototype.render = function (id) {
		this._getObservations(id);
		this._updateSelected(id);
	};


	ObservatoryView.prototype._initialize = function () {
		var _this = this,
		    el = this._el,
		    id = this._options.observatoryId,
		    hash;

		hash = this._getHash();

		// Overview of a single observatory, one column layout
		if (id) {
			el.innerHTML = [
					'<section class="observatories"></section>',
					'<section class="observations-view"></section>',
			].join('');

			this._getObservations(id);

		// Overview of all observatories/ observations, two column layout
		} else {
			el.innerHTML = [
					'<section class="observatories column one-of-two"></section>',
					'<section class="observations-view column one-of-two"></section>',
			].join('');

			// TODO, find better way to render first observatory
			this._options.observatoryId = (hash) ? hash : 2; // render the first observatory
			this._getObservatories();
			this.render(this._options.observatoryId);
		}

		// on a URL change, update the observatory
		Events.on('hashchange', function() {
			_this.render(_this._getHash());
		});

	};


	ObservatoryView.prototype._getObservatories = function () {

		var _this = this,
		    factory = this._options.factory;

		_this.observatoryId = this._options.observatoryId;

		// load observatories
		factory.getObservatories({
			success: function (observatories) {
				_this._buildObservatoryList(observatories);
				_this._updateSelected(_this.observatoryId);
			}
		});
	};

	ObservatoryView.prototype._buildObservatoryList = function (data) {

		var el = this._el.querySelector('.observatories'),
		    observatoryList = document.createElement('ul'),
		    observatory, listItem, link;

		for (var i = 0; i < data.length; i++) {
			observatory = data[i];

			link = document.createElement('a');
			link.innerHTML = observatory.get('name');
			link.href = '#' + observatory.get('id');

			listItem = document.createElement('li');
			listItem.id = 'observatory_' + observatory.get('id');
			listItem.appendChild(link);

			observatoryList.appendChild(listItem);

			//this._bindObservatoryListItems(listItem);
		}

		el.innerHTML = '<h2>Observatory</h2>';
		el.appendChild(observatoryList);

	};


	ObservatoryView.prototype._updateSelected = function (id) {

		// clear last selected observatory
		var selected = document.querySelector('.selected'),
		    element = document.getElementById('observatory_' + id);

		if (selected) {
			selected.className = '';
		}
		// highlight currently selected observatory
		if (element) {
			element.className = 'selected';
		}
	};


	// list observations for observatory
	ObservatoryView.prototype._getObservations = function (id) {
		var _this = this,
		    el = this._el,
		    factory = this._options.factory;

		this._observationsView = null;

		factory.getObservatory({
			id: id,
			success: function (data) {
				_this._observationsView = new ObservationsView({
					el: el.querySelector('.observations-view'),
					observations: data.get('observations').data()
				});
				el.querySelector('.title').innerHTML = data.get('name');
			}
		});
	};


	ObservatoryView.prototype._getHash = function(url){

		var hash;

		if (typeof url === 'undefined' || url === null){
			url = window.location.hash;
		}

		if (url.indexOf('#') === -1) {
			return null;
		}

		hash = url.substr(url.indexOf('#') + 1, url.length - url.indexOf('#'));

		// Fix URL encoding of settings hash
		hash = unescape(hash);

		return hash;
	};

	return ObservatoryView;
});
