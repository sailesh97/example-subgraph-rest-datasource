//subgraphs\node_modules\@apollo\server-plugin-response-cache\dist\esm

import { HeaderMap, } from '@apollo/server';
import { createHash } from '@apollo/utils.createhash';
import { PrefixingKeyValueCache, } from '@apollo/utils.keyvaluecache';
var SessionMode;
(function (SessionMode) {
    SessionMode[SessionMode["NoSession"] = 0] = "NoSession";
    SessionMode[SessionMode["Private"] = 1] = "Private";
    SessionMode[SessionMode["AuthenticatedPublic"] = 2] = "AuthenticatedPublic";
})(SessionMode || (SessionMode = {}));
function sha(s) {
    return createHash('sha256').update(s).digest('hex');
}
function isGraphQLQuery(requestContext) {
    return requestContext.operation?.operation === 'query';
}
export default function plugin(options = Object.create(null)) {
    return {
        async requestDidStart(outerRequestContext) {
            const cache = new PrefixingKeyValueCache(options.cache ?? outerRequestContext.cache, 'fqc:');
            const generateCacheKey = options.generateCacheKey ?? ((_, key) => sha(JSON.stringify(key)));
            let sessionId = null;
            let baseCacheKey = null;
            let age = null;
            console.log('cache in node_modules esm---', cache?.wrapped?.cache?.valList)

            return {
                async responseForOperation(requestContext) {
                    requestContext.metrics.responseCacheHit = false;
                    if (!isGraphQLQuery(requestContext)) {
                        return null;
                    }
                    async function cacheGet(contextualCacheKeyFields) {
                        const cacheKeyData = {
                            ...baseCacheKey,
                            ...contextualCacheKeyFields,
                        };
                        const key = generateCacheKey(requestContext, cacheKeyData);
                        const serializedValue = await cache.get(key);
                        if (serializedValue === undefined) {
                            return null;
                        }
                        console.log('\n\n Reading from cache-----', serializedValue);

                        const value = JSON.parse(serializedValue);
                        requestContext.overallCachePolicy.replace(value.cachePolicy);
                        requestContext.metrics.responseCacheHit = true;
                        age = Math.round((+new Date() - value.cacheTime) / 1000);
                        return {
                            body: { kind: 'single', singleResult: { data: value.data } },
                            http: {
                                status: undefined,
                                headers: new HeaderMap(),
                            },
                        };
                    }
                    let extraCacheKeyData = null;
                    if (options.sessionId) {
                        sessionId = await options.sessionId(requestContext);
                    }
                    if (options.extraCacheKeyData) {
                        extraCacheKeyData = await options.extraCacheKeyData(requestContext);
                    }
                    baseCacheKey = {
                        source: requestContext.source,
                        operationName: requestContext.operationName,
                        variables: { ...(requestContext.request.variables || {}) },
                        extra: extraCacheKeyData,
                    };
                    if (options.shouldReadFromCache) {
                        const shouldReadFromCache = await options.shouldReadFromCache(requestContext);
                        if (!shouldReadFromCache)
                            return null;
                    }
                    if (sessionId === null) {
                        return cacheGet({ sessionMode: SessionMode.NoSession });
                    }
                    else {
                        const privateResponse = await cacheGet({
                            sessionId,
                            sessionMode: SessionMode.Private,
                        });
                        if (privateResponse !== null) {
                            return privateResponse;
                        }
                        return cacheGet({ sessionMode: SessionMode.AuthenticatedPublic });
                    }
                },
                async willSendResponse(requestContext) {
                    const logger = requestContext.logger || console;
                    if (requestContext.response.body.kind !== 'single') {
                        return;
                    }
                    if (!isGraphQLQuery(requestContext)) {
                        return;
                    }
                    if (requestContext.metrics.responseCacheHit) {
                        const http = requestContext.response.http;
                        if (http && age !== null) {
                            http.headers.set('age', age.toString());
                        }
                        return;
                    }
                    if (options.shouldWriteToCache) {
                        const shouldWriteToCache = await options.shouldWriteToCache(requestContext);
                        if (!shouldWriteToCache)
                            return;
                    }
                    const { data, errors } = requestContext.response.body.singleResult;
                    const policyIfCacheable = requestContext.overallCachePolicy.policyIfCacheable();
                    if (errors || !data || !policyIfCacheable) {
                        return;
                    }
                    if (!baseCacheKey) {
                        throw new Error('willSendResponse called without error, but execute not called?');
                    }
                    const cacheSetInBackground = (contextualCacheKeyFields) => {
                        const cacheKeyData = {
                            ...baseCacheKey,
                            ...contextualCacheKeyFields,
                        };
                        const key = generateCacheKey(requestContext, cacheKeyData);
                        const value = {
                            data,
                            cachePolicy: policyIfCacheable,
                            cacheTime: +new Date(),
                        };
                        const serializedValue = JSON.stringify(value);
                        cache
                            .set(key, serializedValue, { ttl: policyIfCacheable.maxAge })
                            .catch(logger.warn);
                    };
                    const isPrivate = policyIfCacheable.scope === 'PRIVATE';
                    if (isPrivate) {
                        if (!options.sessionId) {
                            logger.warn('A GraphQL response used @cacheControl or setCacheHint to set cache hints with scope ' +
                                "Private, but you didn't define the sessionId hook for " +
                                'apollo-server-plugin-response-cache. Not caching.');
                            return;
                        }
                        if (sessionId === null) {
                            return;
                        }
                        cacheSetInBackground({
                            sessionId,
                            sessionMode: SessionMode.Private,
                        });
                    }
                    else {
                        cacheSetInBackground({
                            sessionMode: sessionId === null
                                ? SessionMode.NoSession
                                : SessionMode.AuthenticatedPublic,
                        });
                    }
                },
            };
        },
    };
}
//# sourceMappingURL=ApolloServerPluginResponseCache.js.map