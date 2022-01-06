class TokenModificator {
    constructor() {}

    static initialize() {
        TokenModificator.hooksOnUpdateActor();
    }

    static hooksOnUpdateActor() {

        Hooks.on('updateActor', function (actor, changes) {
            if (changes.data?.status?.mount?.mounted !== undefined){
                console.log('Con Token | updateActor mount');
                var img = actor.data.token.img;
                var token = TokenModificator.getTokenForActor(actor);
                if (img === undefined || img === "")
                    return;
                if (changes.data?.status?.mount?.mounted === true){
                    TokenModificator.updateVariantToken(img, "Mount", actor);
                    token.update({'scale': 2});
                    actor.update({"token.scale": 2});
                    console.log('Con Token | updated to mounted');
                } else if (changes.data?.status?.mount?.mounted === false) {
                    var newTokenPath = TokenModificator.getDefaultToken(img);
                    TokenModificator.setTokenImage(newTokenPath, actor);
                    token.update({'scale': 1});
                    actor.update({"token.scale": 1});
                    console.log('Con Token | updated to unmounted');
                }
            }
        });

        Hooks.on("updateItem", (item) => {
            console.log("Con Token | updateItem");
            var actor = item.parent;
            var img = actor.data.token.img;
            if (img === undefined || img === "")
                return;
            
            console.log(item.data.data.worn);
            console.log(item.data.data.equipped);
            if (item.data.data.equipped === true || item.data.data.worn === true) {
                TokenModificator.updateVariantToken(img, item.name, actor);
            } else if (item.data.data.equipped === false || item.data.data.worn === false) {
                if (img.includes(item.name)){
                    var newTokenPath = TokenModificator.getDefaultToken(img);
                    TokenModificator.setTokenImage(newTokenPath, actor);
                } else {
                    console.log("Con Token | Ignoring this because it's not the active variant");
                }
            }
        });
    }

    static setTokenImage(imgPath, actor) {
        var token = this.getTokenForActor(actor);
        token.update({'img': imgPath});
        actor.update({"token.img": imgPath});
    }

    static getDefaultToken(tokenPath){
        var pathParts = tokenPath.split('/');
        var fileName = pathParts.pop() || pathParts.pop(); // handle potential trailing slash
        var filenameParts = fileName.split('.');
        var fileEnding = filenameParts.pop() || filenameParts.pop();
        var fileNameWithoutEnding = filenameParts.join('.');
        var tokenFolder = pathParts.join('/');
        var character;
        if (this.isVariant(fileNameWithoutEnding)){
            var fileNameParts2 = fileNameWithoutEnding.split('_');
            fileNameParts2.pop();
            character = fileNameParts2.join('_');
        } else {
            character = fileNameWithoutEnding;
        }
        return tokenFolder+'/'+character+'.'+fileEnding;
    }

    static updateVariantToken(tokenPath, toggledItem, actor) {
        var pathParts = tokenPath.split('/');
        var fileName = pathParts.pop() || pathParts.pop(); // handle potential trailing slash
        var filenameParts = fileName.split('.');
        var fileEnding = filenameParts.pop() || filenameParts.pop();
        var fileNameWithoutEnding = filenameParts.join('.');
        var tokenFolder = pathParts.join('/');
        var character;
        if (this.isVariant(fileNameWithoutEnding)) {
            var fileNameParts2 = fileNameWithoutEnding.split('_');
            fileNameParts2.pop();
            character = fileNameParts2.join('_');
        } else {
            character = fileNameWithoutEnding;
        }
        var newToken = tokenFolder + '/' + character + '_' + toggledItem + '.' + fileEnding;

        this.srcExists(newToken).then(value => {
            if (value === true){
                console.log('Con Token | Update token to variant!');
                this.setTokenImage(newToken, actor)
            } else {
                console.log('Con Token | Variant not found - ignore');
            }
        });
    }

    /**
     * Test whether a file source exists by performing a HEAD request against it
     * @param {string} src    The source URL or path to test
     * @return {boolean}      Does the file exist at the provided url?
     */
    static async srcExists(src) {
        return await fetch(src, {method: 'HEAD'})
            .then(resp => {
                return resp.status === 200
            })
            .catch(err => false);
    }

    static getCharacterName(tokenPath){
        var pathParts = tokenPath.split('/');
        var fileName = pathParts.pop() || pathParts.pop(); // handle potential trailing slash
        var filenameParts = fileName.split('.');
        var fileEnding = filenameParts.pop() || filenameParts.pop();
        var fileNameWithoutEnding = filenameParts.join('.');
        var characterName;
        if (this.isVariant(fileNameWithoutEnding)){
            var fileNameParts2 = fileNameWithoutEnding.split('_');
            fileNameParts2.pop();
            characterName = fileNameParts2.join('_');
        } else {
            characterName = fileNameWithoutEnding;
        }
        return characterName;
    }

    static isVariant(characterName){
        return characterName.includes('_');
    }

    static getTokenForActor(actor) {
        return canvas.tokens.placeables.filter((t) => t.actor).find((t) => t.actor.id === actor.id);
    }
}

Hooks.on("ready", () => {
    if (game.user.isGM) TokenModificator.initialize();
});