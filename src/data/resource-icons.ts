export const RESOURCE_ICON_MAP: Record<string, string> = {
    // Cloud Machine types
    'Cloud.Machine': 'machine_v_sphere_machine.svg',
    'Cloud.vSphere.Machine': 'machine_v_sphere_machine.svg',
    'Cloud.AWS.EC2.Instance': 'ec2_instance_aws_ec2_instance.svg',
    'Cloud.Azure.Machine': 'azure_machine_azure_vm.svg',
    'Cloud.GCP.Machine': 'compute_instance_gcp_compute_instance.svg',

    // Networks
    'Cloud.Network': 'network_helper_allocation_network.svg',
    'Cloud.vSphere.Network': 'network_helper_allocation_network.svg',
    'Cloud.NSX.Network': 'nsx_network_nsx_t_network.svg',
    'Cloud.AWS.Network': 'vpc_aws_vpc.svg',
    'Cloud.Azure.Network': 'virtual_network_azure_virtual_network.svg',

    // Storage/Volumes
    'Cloud.Volume': 'volume_storage.svg',
    'Cloud.vSphere.Disk': 'volume_storage.svg',
    'Cloud.AWS.Volume': 'volume_aws_volume.svg',
    'Cloud.Azure.Disk': 'managed_disk_azure_managed_disk.svg',

    // Load Balancers
    'Cloud.LoadBalancer': 'load_balancer_zap.svg',
    'Cloud.NSX.LoadBalancer': 'lb_f5_big_ip_load_balancer.svg',

    // Security Groups
    'Cloud.SecurityGroup': 'security_group_shield.svg',
    'Cloud.NSX.SecurityGroup': 'security_group_shield.svg',

    // Databases
    'Cloud.AWS.RDS.Instance': 'rds_instance_aws_rds.svg',
    'Cloud.Azure.SQLDatabase': 'sql_database_azure_sql_database.svg',

    // Kubernetes / Containers
    'Cloud.K8S.Cluster': 'tkgi_cluster_k8s_cluster.svg',

    // Terraform
    'Cloud.Terraform.Configuration': 'terraform_configuration_terraform_config.svg',

    // Default fallback (though we usually handle this in the component)
    'Unknown': 'cpu.svg'
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
    if (t.includes('machine')) return 'machine_v_sphere_machine.svg';
    if (t.includes('network')) return 'network_helper_allocation_network.svg';
    if (t.includes('disk') || t.includes('volume')) return 'volume_storage.svg';
    if (t.includes('loadbalancer')) return 'load_balancer_zap.svg';
    if (t.includes('security')) return 'security_group_shield.svg';
    if (t.includes('database') || t.includes('sql')) return 'sql_database_azure_sql_database.svg';

    return 'machine_helper_allocation_compute.svg'; // Generic component icon
};
