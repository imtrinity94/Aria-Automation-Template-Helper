export const RESOURCE_ICON_MAP: Record<string, string> = {
    // Cloud Machine types
    'Cloud.Machine': 'machine_vsphere_vm.svg',
    'Cloud.vSphere.Machine': 'machine_vsphere_vm.svg',
    'Cloud.AWS.EC2.Instance': 'instance_aws_machine.svg',
    'Cloud.Azure.Machine': 'machine_azure_machine.svg',
    'Cloud.GCP.Machine': 'instance_gcp_compute_engine.svg',

    // Networks
    'Cloud.Network': 'network_helper_allocation_network.svg',
    'Cloud.vSphere.Network': 'network_vsphere_network.svg',
    'Cloud.NSX.Network': 'network_helper_allocation_network.svg',
    'Cloud.AWS.Network': 'network_network_globe.svg',
    'Cloud.Azure.Network': 'network_network_globe.svg',

    // Storage/Volumes
    'Cloud.Volume': 'volume_storage.svg',
    'Cloud.vSphere.Disk': 'disk_vsphere_disk.svg',
    'Cloud.AWS.Volume': 'volume_aws_volume.svg',
    'Cloud.Azure.Disk': 'disk_azure_disk.svg',

    // Load Balancers
    'Cloud.LoadBalancer': 'load_balancer_load_balancer.svg',
    'Cloud.NSX.LoadBalancer': 'load_balancer_load_balancer.svg',

    // Security Groups
    'Cloud.SecurityGroup': 'security_group_shield.svg',
    'Cloud.NSX.SecurityGroup': 'security_group_shield.svg',

    // Databases
    'Cloud.AWS.RDS.Instance': 'db_instance_aws_db.svg',
    'Cloud.Azure.SQLDatabase': 'sql_database_azure_sql_database.svg',

    // Kubernetes / Containers
    'Cloud.K8S.Cluster': 'tkgi_cluster_k8s_cluster.svg',

    // Terraform
    'Cloud.Terraform.Configuration': 'terraform_configuration_terraform_config.svg',

    // Default fallback
    'Unknown': 'compute_helper_allocation_compute.svg'
};

/**
 * Helper to get the best matching icon for a resource type
 */
export const getResourceIcon = (type: string): string => {
    // Exact match
    if (RESOURCE_ICON_MAP[type]) return RESOURCE_ICON_MAP[type];

    // Partial match (prefix)
    const match = Object.keys(RESOURCE_ICON_MAP).find(k => type.startsWith(k));
    if (match) return RESOURCE_ICON_MAP[match];

    // Generic fallbacks based on keywords
    const t = type.toLowerCase();
    if (t.includes('machine') || t.includes('instance')) return 'machine_vsphere_vm.svg';
    if (t.includes('network')) return 'network_helper_allocation_network.svg';
    if (t.includes('disk') || t.includes('volume')) return 'volume_storage.svg';
    if (t.includes('loadbalancer') || t.includes('lb')) return 'load_balancer_load_balancer.svg';
    if (t.includes('security')) return 'security_group_shield.svg';
    if (t.includes('database') || t.includes('sql') || t.includes('rds')) return 'db_instance_aws_db.svg';

    return 'compute_helper_allocation_compute.svg'; // Generic component icon
};
