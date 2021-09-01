import { AAITEMCHECK, AAITEMCHECKFREE } from "../animation-functions/item-arrays.js";
import thunderwaveAuto from "../animation-functions/thunderwave.js";
import ctaCall from "../animation-functions/CTAcall.js";
import huntersMark from "../animation-functions/custom-sequences/hunters-mark.js";
import bardicInspiration from "../animation-functions/custom-sequences/bardic-inspiration.js";
import { rangedAnimations } from "../animation-functions/rangedAnimation.js";
import { meleeAnimation } from "../animation-functions/meleeAnimation.js";
import { onTokenAnimation } from "../animation-functions/onTokenAnimation.js";
import { explodeOnToken } from "../animation-functions/explodeOnToken.js";
import { teleportation } from "../animation-functions/teleportation.js";
import { templateAnimation } from "../animation-functions/templateAnimation.js";
import { shieldSpell } from "../animation-functions/custom-sequences/shield.js";
import { sneakAttack } from "../animation-functions/custom-sequences/sneak-Attack.js";
import { bless } from "../animation-functions/custom-sequences/bless.js";

const wait = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

function moduleIncludes(test) {
    return !!game.modules.get(test);
}
async function itemSound(handler) {
    let audio = handler.allSounds.item;
    if (handler.itemSound) {
        await wait(audio.delay);
        AudioHelper.play({ src: audio.file, volume: audio.volume, autoplay: true, loop: false }, true);
    }
}

function getAllNames(obj, type) {
    const nameArray = []
    const arrayLength = Object.keys(obj[type]).length
    for (var i = 0; i < arrayLength; i++) {
        nameArray.push(obj[type][i].name.toLowerCase())
    }
    return nameArray;
}

function findObjectByName(data, type, name) {
    return Object.values(data[type]).filter(section => {
        return section.name.toLowerCase() === (name.toLowerCase()) ? section : "";
    })
}

function autorecNameCheck(nameArray, name) {
    const arrayLength = nameArray.length;
    let nameFound = false;
    for (var i = 0; i < arrayLength; i++) {
        if (nameArray[i].toLowerCase() === name) {
            nameFound = true;
        }
    }
    //console.log(nameFound)
    return nameFound;
}

function rinseName(oldName) {
    let newName = oldName.replace(/[+1]|[+2]|[+3]/gi, function (x) {
        return "";
    });
    newName = newName.trim("\s+$/g", "")
    return newName;
}

export async function trafficCop(handler) {
    const autoRecSettings = game.settings.get('autoanimations', 'aaAutorec');
    console.log(autoRecSettings)
    const itemArray = moduleIncludes("jb2a_patreon") ? AAITEMCHECK : AAITEMCHECKFREE;
    if (handler.itemSound) {
        itemSound(handler);
    }
    if (handler.animKill) { return; }
    const itemName = handler.convertedName;
    const animName = handler.animName;
    const animType = handler.animType;
    const override = handler.animOverride;
    const targets = handler.allTargets?.length ?? 0;
    if (override) {
        switch (animType) {
            case "t2":
            case "t3":
                if (targets === 0) {
                    Hooks.callAll("aa.animationEnd", handler.actorToken, "no-target");
                    return;
                }
                Hooks.callAll("aa.preAnimationStart", handler.actorToken);
                meleeAnimation(handler);
                break;
            case "t4":
                if (targets === 0) {
                    Hooks.callAll("aa.animationEnd", handler.actorToken, "no-target");
                    return;
                }
                Hooks.callAll("aa.preAnimationStart", handler.actorToken);
                rangedAnimations(handler);
                break;
            case "t5":
                if (targets === 0) {
                    Hooks.callAll("aa.animationEnd", handler.actorToken, "no-target");
                    return;
                }
                Hooks.callAll("aa.preAnimationStart", handler.actorToken);
                onTokenAnimation(handler);
                break;
            case "t6":
                if (targets === 0) {
                    Hooks.callAll("aa.animationEnd", handler.actorToken, "no-target");
                    return;
                }
                Hooks.callAll("aa.preAnimationStart", handler.actorToken);
                rangedAnimations(handler);
                break;
            case "t7":
                onTokenAnimation(handler);
                break;
            case "t8":
                if (game.modules.get("midi-qol")?.active) { return; }
                //some do not need hook on template, depends on when damage is rolled
                switch (game.system.id) {
                    case "dnd5e":
                    case "pf2e":
                        if (game.modules.get("mars-5e")?.active) {
                            templateAnimation(handler);
                        } else {
                            Hooks.once("createMeasuredTemplate", () => {
                                templateAnimation(handler);
                            });
                        }
                        break;
                    default:
                        templateAnimation(handler);
                }
                break;
            case "t9":
            case "t10":
                explodeOnToken(handler);
                break;
            case "t11":
                if (game.modules.get("Custom-Token-Animations")?.active) {
                    ctaCall(handler);
                } else { ui.notifications.error("Custom Token Animations module must be Active") }
                break;
            case "t12":
                teleportation(handler);
                break;
            case "t13":
                switch (animName) {
                    case "bardicinspiration":
                        bardicInspiration(handler);
                        break;
                    case "shieldspell":
                        shieldSpell(handler);
                        break;
                    case "huntersmark":
                        huntersMark(handler)
                        break;
                    case "sneakattack":
                        sneakAttack(handler);
                        break;
                    case "bless":
                        bless(handler);
                        break;
                }
                break;
        }
    } else {
        if (!game.settings.get("autoanimations", "disableAutoRec")) {
            const nameArrays = {
                melee: getAllNames(autoRecSettings, 'melee'),
                range: [...getAllNames(autoRecSettings, 'range'), ...getAllNames(autoRecSettings, 'attackspell')],
            }
            const autoName = rinseName(handler.itemName);
            console.log(autoName)
            //console.log(nameArrays)
            //console.log(findAllByKey(autoRecSettings, "name"))
            switch (true) {
                case itemName === "thunderwave":
                    switch (true) {
                        case (game.modules.get("midi-qol")?.active && (handler.autoDamage === "none")):
                            thunderwaveAuto(handler);
                            break;
                        default:
                            Hooks.once("createMeasuredTemplate", () => {
                                thunderwaveAuto(handler);
                            })
                    }
                    break;
                //case nameArrays.melee.includes(handler.itemName):
                //case nameArrays.melee.some(el => handler.itemName.includes(el)):
                case autorecNameCheck(nameArrays.melee, autoName):
                    if (targets === 0) {
                        Hooks.callAll("aa.animationEnd", handler.actorToken, "no-target");
                        return;
                    }
                    Hooks.callAll("aa.preAnimationStart", handler.actorToken);
                    const meleeAutoObject = findObjectByName(autoRecSettings, 'melee', autoName)
                    console.log(meleeAutoObject)                
                    meleeAnimation(handler, meleeAutoObject);
                    break;
                //case nameArrays.range.includes(handler.itemName):
                case autorecNameCheck(nameArrays.range, autoName):
                    //case itemArray.spellattack.includes(itemName):
                    //case itemArray.ranged.includes(itemName):
                    if (targets === 0) {
                        Hooks.callAll("aa.animationEnd", handler.actorToken, "no-target");
                        return;
                    }
                    Hooks.callAll("aa.preAnimationStart", handler.actorToken);
                    const spellAutoObject = findObjectByName(autoRecSettings, 'attackspell', autoName)
                    const rangeAutoObject = spellAutoObject.length === 0 ? findObjectByName(autoRecSettings, 'range', handler.item.name) : spellAutoObject;
                    console.log(rangeAutoObject)                
                    rangedAnimations(handler, rangeAutoObject);
                    break;
                case itemArray.healing.includes(itemName):
                case itemArray.creatureattack.includes(itemName):
                    Hooks.callAll("aa.preAnimationStart", handler.actorToken);
                    onTokenAnimation(handler);
                    break;
            }
        }
    }
}
