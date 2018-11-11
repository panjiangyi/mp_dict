import Utils from '../utils/utils';
import flag from './flag.js';
const { success, fail } = flag;
const {
    loading,
    loaded
} = Utils;
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
        loading();
        this.openid = await this._getOpenid();
        loaded();
        return await this.where()
    }
    async read(word) {
        loading();
        const res = await this.dict.doc(word).get();
        loaded();
        return res.data
    }
    async save(language, group, word, meanings) {
        loading();
        const res = await this.dict.add({
            data: {
                word,
                meanings,
                language,
                group
            }
        });
        loaded();
        if (res.errMsg !== 'collection.add:ok') {
            Utils.toastError();
            return fail
        } else {
            return success
        }
    }
    async update(id, data) {
        loading();
        const res = await this.dict.doc(id).update({ data })
        loaded();
        return success;
    }
    async where(rule = {}) {
        let result = [];
        let i = 0;
        loading();
        while (true) {
            const { data } = await this.dict.skip(i).where({ ...rule, _openid: this.openid }).get();
            if (data.length === 0) break;
            result = result.concat(data);
            i += 20;
        }
        loaded();
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
        loading();
        const data = await this.where({
            ...rule
        });
        const ids = data.map(item => item._id);
        const res = await Promise.all(ids.map(id => this.deleteWord(id)))
        loaded();
        if (res.indexOf(false) > -1) {
            Utils.toastError();
            return fail
        } else {
            return success
        }
    }
}

export default new Dictionary()