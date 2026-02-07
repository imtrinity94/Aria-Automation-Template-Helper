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

export const SAMPLE_BLUEPRINT_ADVANCED = `formatVersion: 1
inputs:
  platform:
    type: string
    title: Deploy to
    oneOf:
      - title: AWS
        const: aws
      - title: Azure
        const: azure
      - title: vSphere
        const: vsphere
    default: vsphere
  disks:
    type: array
    items:
      type: integer
    default: [10, 20]
resources:
  Machine:
    type: Cloud.Machine
    preventDelete: true
    properties:
      image: ubuntu
      flavor: small
      attachedDisks: '\${map_to_object(resource.Volume[*].id, "source")}'
      networks:
        - network: '\${resource.Network.id}'
  Volume:
    type: Cloud.Volume
    count: '\${length(input.disks)}'
    properties:
      capacityGb: '\${input.disks[count.index]}'
  Network:
    type: Cloud.Network
    properties:
      networkType: existing`;

export const SAMPLES = [
  { name: 'Simple Machine & Network', code: SAMPLE_BLUEPRINT_SIMPLE },
  { name: 'Load Balancer + Web Tier', code: SAMPLE_BLUEPRINT_COMPLEX },
  { name: 'Advanced: Inputs, Flags & Functions', code: SAMPLE_BLUEPRINT_ADVANCED },
];
