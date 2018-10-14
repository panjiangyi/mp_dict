import Utils from '../utils/utils';
import flag from './flag.js';
const { success, fail } = flag;
class Dictionary {
    constructor() {
        wx.cloud.init({
            traceUser: true
        });
        this.instantiateDb()
    }
    instantiateDb() {
        const db = wx.cloud.database({
            env: 'my-dictionary-f77667'
        });
        this.dict = db.collection('dict');
    }
    async _getOpenid() {
        return await Utils.getOpenid();
    }
    async all() {
        const _openid = this._getOpenid()
        const res = await this.dict
            .where({
                _openid
            })
            .get();
        return res.data
    }
    async read(word) {
        const res = await this.dict.doc(word).get();
        return res.data
    }
    async save(language, group, word, meanings) {
        const res = await this.dict.add({
            data: {
                word,
                meanings,
                language,
                group
            }
        });
        if (res.errMsg !== 'collection.add:ok') {
            Utils.toastError();
            return fail
        } else {
            return success
        }
    }
    async update(id, data) {
        const res = await this.dict.doc(id).update({ data })
        return success;
    }
    async where(rule) {
        const res = await this.dict.where(rule).get();
        return res.data;
    }
}

export default new Dictionary()