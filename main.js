class TokenModificator {
    constructor() {}

    static initialize() {
        TokenModificator.hooksOnUpdateActor();
    }

    static hooksOnUpdateActor() {
        Hooks.on("updateOwnedItem", (actor, toggledItem) => {
            var img = actor.data.token.img;
            if (img === undefined || img === "")
                return;

            var newTokenPath;
            if (toggledItem.data.equipped === true) {
                this.updateVariantToken(img, toggledItem.name, actor);
            } else if (toggledItem.data.equipped === false) {
                if (this.isVariant(this.getCharacterName(img))){
                    newTokenPath = this.getDefaultToken(img);
                    this.setTokenImage(newTokenPath, actor);
                } else {
                    console.log("Con Token | Ignoring this because it's not a variant");
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
        var result = await fetch(src, {method: 'HEAD'})
            .then(resp => {
                return resp.status === 200
            })
            .catch(err => false);
        return result;
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