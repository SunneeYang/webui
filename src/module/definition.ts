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
export interface MiddlewareCfg {
    type: string,
    name: string,
    config: string,
}

// 其他配置
export interface OtherCfg {
    pipeline: string,
    realm: RealmCfg,
}

// Realm Config
export interface RealmCfg {
    strategy: string,
}

// Dev Node
export interface DevNode {
    id: number,
    name: string,
    ip: string,
    innerPort: number,
    watcherPort: number,
    grpcPort: number,
    scene: DevScene[],
}

export interface DevScene {
    id: number,
    type: string,
    name: string,
    outerPort: number | undefined,
}

// Release Node
export interface RelNode {
    outerPort: number,
    innerPort: number,
    watcherPort: number,
    grpcPort: number,
}

export interface RelScene {
    type: string,
    replicas: number,
    outer?: RelOuter[],
}

export interface RelOuter {
    ip: string,
    port: number,
}