export const SAMPLE_BLUEPRINT_SIMPLE = `formatVersion: 1
inputs: {}
resources:
  Cloud_Machine_1:
    type: Cloud.Machine
    properties:
      image: ubuntu
      flavor: small
      networks:
        - network: '\${resource.Cloud_Network_1.id}'
  Cloud_Network_1:
    type: Cloud.Network
    properties:
      networkType: existing`;

export const SAMPLE_BLUEPRINT_COMPLEX = `formatVersion: 1
inputs:
  count:
    type: integer
    default: 2
resources:
  LoadBalancer:
    type: Cloud.LoadBalancer
    properties:
      routes:
        - protocol: HTTP
          port: 80
          instancePort: 80
      instances:
        - '\${resource.WebTier.id}'
      internetFacing: true
  
  WebTier:
    type: Cloud.Machine
    properties:
      count: '\${input.count}'
      image: ubuntu
      flavor: medium
      networks:
        - network: '\${resource.AppNet.id}'
      attachedDisks: []
      
  AppNet:
    type: Cloud.Network
    properties:
      networkType: public`;

export const SAMPLES = [
    { name: 'Simple Machine & Network', code: SAMPLE_BLUEPRINT_SIMPLE },
    { name: 'Load Balancer + Web Tier', code: SAMPLE_BLUEPRINT_COMPLEX },
];
