// ==UserScript==
// @name        Clickpocalypse2Clicker
// @namespace   C2C
// @description Clicker Bot for Clickpocalypse2
// @include     http://minmaxia.com/c2/
// @include     https://minmaxia.com/c2/
// @version     1.0.8
// @grant       none
// @require https://code.jquery.com/jquery-3.1.0.slim.min.js
// ==/UserScript==

// This saves scrolls for boss encounters.
var scrollReserve = 15;

// This will fire scrolls no matter what, if we hit this limit... (so we can pick up new scrolls).
var scrollUpperBound = 29;
const CHAR_CLASS_LIST = [
  "Fighter",
  "Priest",
  "Ranger",
  "Pyro",
  "Rogue",
  "Druid",
  "Barbarian",
  "Electro",
  "Ninja",
  "Necro",
  "Chicken King",
  "Spider Lord"
];
const skillStrategy = {
  "Fighter" : [0, 1, 2, 3],
  "Priest" : [2, 1, 4, 0],
  "Ranger" : [0, 1, 2, 3],
  "Pyro" : [3, 2, 1, 0],
  "Rogue" : [3, 2, 1, 0],
  "Druid" : [0, 3, 1, 2],
  "Barbarian" : [0, 1, 3, 2],
  "Electro" : [3, 2, 1, 0],
  "Ninja" : [0, 3, 1, 2],
  "Necro" : [1, 2, 0, 3],
  "Chicken King" : [0, 1, 2, 3],
  "Spider Lord" : [0, 3, 1, 2],
};
$(document).ready(function () {

	console.log('Starting Clickpocalypse2Clicker: ' + GM_info.script.version);
  
  let charClasses = [];
	setInterval(function () {
  	if (charClasses.length <= 0) findClasses(charClasses);
		// Determines our encounter states
		var isBossEncounter = ($('.bossEncounterNotificationDiv').length != 0);
		var isEncounter = ($('#encounterNotificationPanel').css('display') !== 'none');
		//console.log("Boss: " +isBossEncounter +" Normal: " +isEncounter);

		// Determine if this is a difficult encounter... (one or more characters are stunned).
		//todo: should cancel search once we find it to be true.
		var isDifficultEncounter = false;
		// slot positions.
		var pos = ['A', 'B', 'C', 'E', 'E', 'F'];
		$.each(pos, function (idx) {
			var letter = pos[idx];

			// character positions.
			for (var char = 0; char < 5; char++) {

				var name = '#adventurerEffectIcon' + letter + char;
				var selector = $(name);
				//console.log("Checking: " + name + " Title: " + selector.attr('title') + " Display " + selector.css('display') + " HTML: " +selector.html());
				if (selector.attr('title') === 'Stunned' && selector.css('display') !== 'none') {
					isDifficultEncounter = true;

				}
			}
		});

		//console.log("isDifficultEncounter: " + isDifficultEncounter);

		// loot them chests... not sure which one of these is working.
		clickSelector($('#treasureChestLootButtonPanel').find('.gameTabLootButtonPanel'));
		clickSelector($('#treasureChestLootButtonPanel').find('.lootButton'));

		// Update AP Upgrades
		for (var row = 0; row < 12; row++) {
			// skip 'Offline Time Bonus' upgrade.
			if (row == 3) {
				continue;
			}
			for (var col = 0; col < 2; col++) {

				var name = "#pointUpgradesContainer_" + row + "_" + col + "_" + row;

				clickIt(name);
			}
		}

		// Cycle though all quick bar upgrades in reverse order.
		for (var i = 43; i >= 0; i--) {
			clickIt('#upgradeButtonContainer_' + i);
		}

		// Get information about potions are active before taking any actions

		var isPotionActive_ScrollsAutoFire = false;
		var isPotionActive_InfinteScrolls = false;
		var potionCount = 0;

		for (var row = 0; row < 4; row++) {
			for (var col = 0; col < 2; col++) {

				var potionSelector = $('#potionButton_Row' + row + '_Col' + col).find('.potionContentContainer');
				var potionName = potionSelector.find('td').eq(1).text();
				var potionActive = (potionSelector.find('.potionButtonActive').length != 0);

				if (potionName.length == 0) {
					continue;
				}

				potionCount++;

				if (potionName === 'Scrolls Auto Fire') {
					isPotionActive_ScrollsAutoFire = potionActive;
				}
				if (potionName === 'Infinite Scrolls') {
					isPotionActive_InfinteScrolls = potionActive;
				}

			}
		}

		//console.log ("AF: " +isPotionActive_ScrollsAutoFire +" IS: " +isPotionActive_InfinteScrolls +" Potion Count: " +potionCount );

		// Click them potions
		for (var row = 0; row < 4; row++) {
			for (var col = 0; col < 2; col++) {

				var potionSelector = $('#potionButton_Row' + row + '_Col' + col).find('.potionContentContainer');
				var potionName = potionSelector.find('td').eq(1).text();
				var potionActive = (potionSelector.find('.potionButtonActive').length != 0);

				if (potionName.length == 0) {
					continue;
				}
				if (potionActive) {
					continue;
				}

				// We don't want to use AutoFire and InfinteScrolls together, since they have similar functions.
				if (potionName === 'Infinite Scrolls' && isPotionActive_ScrollsAutoFire) {
					continue;
				}
				if (potionName === 'Scrolls Auto Fire' && isPotionActive_InfinteScrolls) {
					continue;
				}

				// Always click farm bonus or fast walking potions as soon as we get them, since they are useful anywhere.
				if (potionName === 'Faster Infestation' || potionName === 'More Kills Per Farm' || potionName === 'Faster Farming' || potionName === 'Fast Walking') {
					clickSelector(potionSelector);
					continue;
				}


				// Only click these if we are in battle, no need to chug potions if we are walking around peaceful overworld.
				if (isBossEncounter || isEncounter) {

					if (potionName === 'Infinite Scrolls') {
						isPotionActive_InfinteScrolls = true;
					}
					if (potionName === 'Scrolls Auto Fire') {
						isPotionActive_ScrollsAutoFire = true;
					}

					if (potionName === 'Potions Last Longer') {
						if (potionCount < 6 && !(isPotionActive_InfinteScrolls || isPotionActive_ScrollsAutoFire)) {
							continue;
						}
					}

					if ( (potionName === 'Random Treasure Room' || potionName === 'Double Item Drops' || potionName === 'Double Gold Drops')  
						&& (isPotionActive_InfinteScrolls || isPotionActive_ScrollsAutoFire) ) {
						continue;
					}

					clickSelector(potionSelector);
				}

			}
		}

		// Get info about scrolls before taking any action.
		var totalScrolls = 0;
		for (var i = 0; i < 6; i++) {

			var scrollCell = $('#scrollButtonCell' + i);
			var scrollButton = scrollCell.find('.scrollButton');
			var scrollAmount = scrollCell.find('tr').eq(1).text().replace('x', ''); ;

			if (!scrollAmount.length) {
				continue;
			}

			if (scrollAmount === 'Infinite' || isPotionActive_InfinteScrolls) {
				break;
			}

			// Don't count spider webs
			if (i != 1) {
				totalScrolls += parseInt(scrollAmount);
			}

		}

		//console.log("Total Scrolls:" +totalScrolls);


		// click them scrolls
		for (var i = 0; i < 6; i++) {

			var scrollCell = $('#scrollButtonCell' + i);
			var scrollButton = scrollCell.find('.scrollButton');
			var scrollAmount = scrollCell.find('tr').eq(1).text().replace('x', ''); ;

			if (!scrollAmount.length) {
				continue;
			}

			// Hitting limit, fire scrolls so we can pick up new ones.
			if (scrollAmount > scrollUpperBound) {
				clickSelector(scrollButton);
				continue;
			}


			// Spam spells if Infinite Scrolls potion is active.
			if (scrollAmount === 'Infinite' || isPotionActive_InfinteScrolls) {

				// 4 times per second
				clickSelector(scrollButton);
				setTimeout(clickSelector, 250, scrollButton);
				setTimeout(clickSelector, 500, scrollButton);
				setTimeout(clickSelector, 750, scrollButton);
				continue;
			}

			// Fire 0 scrolls if Autofire is active... it fires them for free, so let's not waste ours.
			// unless boss encounter, we still want to double up on the big guys...
			if (isPotionActive_ScrollsAutoFire && !isBossEncounter && !isDifficultEncounter) {
				continue;
			}

			// 1 === spider web scroll.  Always fire at normal encounters.
			// Boss are immune to spider web, so won't fire them.
			if (i == 1 && !isBossEncounter) {
				clickSelector(scrollButton);
			}


			if (i != 1) {

				// keep scrolls in reserve if generic encounter so we have them for boss.
				// No limit if this is a boss encounter
				if (scrollAmount > scrollReserve || isBossEncounter || isDifficultEncounter) {
					clickSelector(scrollButton);
				}

			}

		}

	}, 1000);
  
  // use a seperate interval to upgrade skills
  let clicked = [];
  setInterval(function() {
    if (!hasSkillPoint()) {
    	clicked = [];
      return;
    }
  	// Level up character skills.
    // Note: the strategy will NOT work properly while you have >1 skill points, becuase a "clickable" skill will be refreshed
    // after a certion time while you just upgrade one. At the same time, the other "clickable" skills will be clicked during
    // that certian time. a solution would be up grade only 1 skill at one interval.
    let upgraded = false;
		for (var charPos = 0; charPos < charClasses.length; charPos++) {
      if (upgraded) break;
      let strategy = skillStrategy[charClasses[charPos]];
      if (!strategy) strategy = [0, 1, 2, 3];
      // try through the columns following the strategy
			strategy.forEach( function (s){
        if (upgraded) return;
				for (var row = 0; row < 9; row++) {
          // There is an ending col on all, not sure why yet
          let id = charPos + '_' + row + '_' + s + '_' + row;
          if (clicked.indexOf(id) < 0) {
            clickIt('#characterSkillsContainer' + id);
            clicked.push(id);
            upgraded = true;
          	return;
          }
				}
			});
		}
    if (!upgraded) clicked = []; // means I didn't click anything
    else upgraded = false; // reset it
  }, 500);
});
/*** Click by div id **/
function clickIt(divName) {
	var div = $(divName);
	if (!div.length) {
		return;
	} // They use mouse up instead of click()

	div.mouseup();
}
/*** Click by Selector **/
function clickSelector($selector) {
	$selector.mouseup();
}
// find char classes
function findClasses(charClasses) {
  let elements = document.querySelectorAll("#gameTabMenu li a");
  if (elements && elements.length)
    elements.forEach(function(e){
      let name = e.text.split(" ")[0];
      if (CHAR_CLASS_LIST.indexOf(name) <= 0) return;
      charClasses.push(name);
    });
}
// check if have available skill points
function hasSkillPoint(charClasses) {
  let elements = document.querySelectorAll("#gameTabMenu li a");
  let hasPoint = false;
  if (elements && elements.length)
    elements.forEach(function(e){
      let name = e.text.split(" ")[0];
      if (CHAR_CLASS_LIST.indexOf(name) <= 0) return;
      if (e.text.split(" ").length > 1) hasPoint = true;
    });
  return hasPoint;
}
