const { AuthClientThreeLeggedV2, AuthClientTwoLeggedV2 } = require('forge-apis');
const config = require('../../config');

class OAuth {
    constructor(session) {
        this._session = session;
    }

    getClient(scopes = config.scopes.internal) {
        const { client_id, client_secret, callback_url } = config.credentials;
        return new AuthClientThreeLeggedV2(client_id, client_secret, callback_url, scopes);
    }

    get2LeggedClient(scopes = config.scopes.internal_2legged) {
        const { client_id, client_secret } = config.credentials;
        return new AuthClientTwoLeggedV2(client_id, client_secret, scopes);
    }

    isAuthorized() {
        return !!this._session.public_token;
    }

    async getPublicToken() {
        if (this._isExpired() && !await this._refreshTokens()) {
            return null;
        }
        return {
            access_token: this._session.public_token,
            expires_in: this._expiresIn()
        };
    }

    async getInternalToken() {
        if (this._isExpired() && !await this._refreshTokens()) {
            return null;
        }
        return {
            access_token: this._session.internal_token,
            expires_in: this._expiresIn()
        };
    }

    async setCode(code) {
        try {
            const internalTokenClient = this.getClient(config.scopes.internal);
            const internalCredentials = await internalTokenClient.getToken(code);
            const publicCredentials = await internalTokenClient.refreshToken(internalCredentials);
    
            this._updateSessionTokens(internalCredentials, publicCredentials);
            return true;
        } catch (err) {
            console.error("Failed to get token due to:", err.response ? err.response.data : err.message);
            return false;
        }
    }

    _expiresIn() {
        const now = new Date();
        const expiresAt = new Date(this._session.expires_at);
        return Math.round((expiresAt.getTime() - now.getTime()) / 1000);
    }

    _isExpired() {
        return (new Date() > new Date(this._session.expires_at));
    }

    async _refreshTokens() {
        try {
            const internalTokenClient = this.getClient(config.scopes.internal);
            const publicTokenClient = this.getClient(config.scopes.public);

            // Ensure we are using the latest refresh token
            const internalCredentials = await internalTokenClient.refreshToken({
                refresh_token: this._session.refresh_token
            });

            const publicCredentials = await publicTokenClient.refreshToken(internalCredentials);

            // Update the session with new tokens
            this._updateSessionTokens(internalCredentials, publicCredentials);
            return true;
        } catch (err) {
            console.error("Failed to refresh token due to:", err.response ? err.response.data : err.message);
            
            // If refreshing fails, clear session to avoid using stale tokens
            this._session.internal_token = null;
            this._session.public_token = null;
            this._session.refresh_token = null;
            this._session.expires_at = null;
            
            return false;
        }
    }

    _updateSessionTokens(internalCredentials, publicCredentials) {
        const now = new Date();
        this._session.internal_token = internalCredentials.access_token;
        this._session.public_token = publicCredentials.access_token;
        this._session.refresh_token = publicCredentials.refresh_token || internalCredentials.refresh_token;
        this._session.expires_at = now.setSeconds(now.getSeconds() + publicCredentials.expires_in);
    }
}

module.exports = { OAuth };
