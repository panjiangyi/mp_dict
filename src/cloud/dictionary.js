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
        this.openid = await this._getOpenid()
        return await this.where()
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
    async where(rule = {}) {
        let result = [];
        let i = 0;
        while (true) {
            const { data } = await this.dict.skip(i).where({ ...rule, _openid: this.openid }).get();
            if (data.length === 0) break;
            result = result.concat(data);
            i += 20;
        }
        return result;
    }
    async deleteWord(id) {
        const res = await this.dict.doc(id).remove()
        if (res.errMsg !== 'document.remove:ok') {
            Utils.toastError();
            return fail
        } else {
            return success
        }
    }
    async deleteGroup(rule) {
        /* 需校验openid，否则会删除其他用户的数据 */
        const { data } = await this.where({
            ...rule
        }).get();
        const ids = data.map(item => item._id);
        const res = await Promise.all(ids.map(id => this.deleteWord(id)))
        if (res.indexOf(false) > -1) {
            Utils.toastError();
            return fail
        } else {
            return success
        }
    }
}

export default new Dictionary()