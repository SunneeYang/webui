export const SceneType = ['Realm', 'Gate', 'Monitor', 'Player', 'Mail', 'Chat', 'Gm', 'Guild', 'Ranklist', 'Friend', 'Manager', 'Battle', 'Pay', 'Homeland', 'Activity', 'Bot']

// 负载均衡
export interface BalanceCfg {
    hashring: string[],
    hashslot: string[],
    random: string[],
}

export interface RedisCfg
{
    url: string,
    db: number,
    names: string[],
}

export interface MongoDbCfg
{
    db: string,
    url: string,
    names: string[],
}

// 中间件
export interface MiddlewareCfg
{
    type: string,
    name: string,
    config: string,
}