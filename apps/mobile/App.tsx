import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Colors } from './src/theme/colors';
import {
  fetchAlerts,
  fetchResponseActions,
  fetchHealth,
  approveMobileAction,
  getApiBaseUrl,
  setApiBaseUrl,
  MobileAlert,
  MobileResponseAction,
} from './src/services/api';

type TabType = 'dashboard' | 'alerts' | 'responses' | 'settings';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [alerts, setAlerts] = useState<MobileAlert[]>([]);
  const [responses, setResponses] = useState<MobileResponseAction[]>([]);
  const [apiOnline, setApiOnline] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [serverUrl, setServerUrl] = useState<string>(getApiBaseUrl());
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');

  // Containment Approval Modal State
  const [selectedAction, setSelectedAction] = useState<MobileResponseAction | null>(null);
  const [approving, setApproving] = useState<boolean>(false);

  const loadData = async () => {
    const [health, alertList, responseList] = await Promise.all([
      fetchHealth(),
      fetchAlerts(),
      fetchResponseActions(),
    ]);
    setApiOnline(health);
    setAlerts(alertList);
    setResponses(responseList);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleApprove = async () => {
    if (!selectedAction) return;
    setApproving(true);
    await approveMobileAction(selectedAction.id);
    setApproving(false);
    setSelectedAction(null);
    Alert.alert(
      'Containment Authorized',
      `Action ${selectedAction.action_type.toUpperCase()} on ${selectedAction.target} has been executed via simulated containment gateway.`
    );
    loadData();
  };

  const criticalCount = alerts.filter((a) => a.severity === 'critical').length;
  const pendingActions = responses.filter((r) => r.status === 'pending_approval').length;
  const filteredAlerts =
    severityFilter === 'ALL'
      ? alerts
      : alerts.filter((a) => a.severity.toUpperCase() === severityFilter);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bgDark} />

      {/* Top Mobile Bar */}
      <View style={styles.topBar}>
        <View style={styles.brandRow}>
          <Text style={styles.brandShield}>🛡️</Text>
          <View>
            <Text style={styles.brandTitle}>SOCForge</Text>
            <Text style={styles.brandSub}>MOBILE OPS • DEFCON 2</Text>
          </View>
        </View>
        <View style={styles.statusPill}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: apiOnline ? Colors.green : Colors.red },
            ]}
          />
          <Text style={styles.statusText}>
            {apiOnline ? 'ONLINE' : 'FALLBACK'}
          </Text>
        </View>
      </View>

      {/* Main Content Area */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.cyan}
          />
        }
      >
        {activeTab === 'dashboard' && (
          <View style={styles.tabContent}>
            {/* DEFCON Threat Alert Banner */}
            <View style={styles.defconCard}>
              <View style={styles.defconHeader}>
                <Text style={styles.defconTitle}>TACTICAL STATUS: DEFCON 2</Text>
                <Text style={styles.defconBadge}>SEV-CRITICAL</Text>
              </View>
              <Text style={styles.defconBody}>
                {criticalCount} active critical intrusion alerts detected across monitored endpoints.
                4-eyes containment approval queue has {pendingActions} pending authorization(s).
              </Text>
            </View>

            {/* Metrics Overview Grid */}
            <View style={styles.gridRow}>
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>ACTIVE ALERTS</Text>
                <Text style={[styles.metricVal, { color: Colors.cyan }]}>
                  {alerts.length}
                </Text>
                <Text style={styles.metricSub}>{criticalCount} Critical Priority</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>PENDING ACTIONS</Text>
                <Text style={[styles.metricVal, { color: Colors.amber }]}>
                  {pendingActions}
                </Text>
                <Text style={styles.metricSub}>Four-Eyes Ledger</Text>
              </View>
            </View>

            <View style={styles.gridRow}>
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>CONTAINED HOSTS</Text>
                <Text style={[styles.metricVal, { color: Colors.green }]}>
                  {responses.filter((r) => r.status === 'executed').length}
                </Text>
                <Text style={styles.metricSub}>Isolated via Adapter</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>MTTR CLOCK</Text>
                <Text style={[styles.metricVal, { color: Colors.purple }]}>
                  4.2m
                </Text>
                <Text style={styles.metricSub}>Mean Containment Time</Text>
              </View>
            </View>

            {/* Quick Action Navigation */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>COMMAND SHORTCUTS</Text>
            </View>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => setActiveTab('responses')}
            >
              <Text style={styles.actionBtnText}>
                🛡️ Review Containment Queue ({pendingActions})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#172554', borderColor: Colors.cyan }]}
              onPress={() => setActiveTab('alerts')}
            >
              <Text style={[styles.actionBtnText, { color: Colors.cyan }]}>
                🚨 Triage Active Alerts Queue
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'alerts' && (
          <View style={styles.tabContent}>
            {/* Filter Pills */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar}>
              {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map((f) => (
                <TouchableOpacity
                  key={f}
                  style={[
                    styles.filterChip,
                    severityFilter === f && styles.filterChipActive,
                  ]}
                  onPress={() => setSeverityFilter(f)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      severityFilter === f && styles.filterChipTextActive,
                    ]}
                  >
                    {f}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Alerts List */}
            {filteredAlerts.map((alert) => (
              <View key={alert.id} style={styles.alertCard}>
                <View style={styles.alertTop}>
                  <View
                    style={[
                      styles.sevBadge,
                      {
                        backgroundColor:
                          alert.severity === 'critical'
                            ? Colors.redGlow
                            : Colors.amberGlow,
                        borderColor:
                          alert.severity === 'critical' ? Colors.red : Colors.amber,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.sevText,
                        {
                          color:
                            alert.severity === 'critical' ? Colors.red : Colors.amber,
                        },
                      ]}
                    >
                      {alert.severity.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.alertSource}>{alert.source}</Text>
                </View>

                <Text style={styles.alertTitle}>{alert.title}</Text>
                {alert.description && (
                  <Text style={styles.alertDesc}>{alert.description}</Text>
                )}

                <View style={styles.alertFooter}>
                  {alert.mitre_attack_id && (
                    <Text style={styles.mitreTag}>
                      {alert.mitre_attack_id} • {alert.mitre_tactic}
                    </Text>
                  )}
                  <Text style={styles.alertTime}>
                    {new Date(alert.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'responses' && (
          <View style={styles.tabContent}>
            <View style={styles.ledgerHeader}>
              <Text style={styles.ledgerTitle}>FOUR-EYES CONTAINMENT LEDGER</Text>
              <Text style={styles.ledgerSub}>
                Authorized Incident Commanders must approve containment requests.
              </Text>
            </View>

            {responses.map((action) => (
              <View key={action.id} style={styles.responseCard}>
                <View style={styles.responseTop}>
                  <Text style={styles.actionType}>
                    {action.action_type.replace('_', ' ').toUpperCase()}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          action.status === 'pending_approval'
                            ? Colors.amberGlow
                            : Colors.greenGlow,
                        borderColor:
                          action.status === 'pending_approval'
                            ? Colors.amber
                            : Colors.green,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        {
                          color:
                            action.status === 'pending_approval'
                              ? Colors.amber
                              : Colors.green,
                        },
                      ]}
                    >
                      {action.status.replace('_', ' ').toUpperCase()}
                    </Text>
                  </View>
                </View>

                <Text style={styles.targetName}>Target: {action.target}</Text>
                {action.reason && (
                  <Text style={styles.reasonText}>Reason: {action.reason}</Text>
                )}
                <Text style={styles.requestedBy}>
                  Requested by: {action.requested_by}
                </Text>

                {action.status === 'pending_approval' && (
                  <TouchableOpacity
                    style={styles.approveBtn}
                    onPress={() => setSelectedAction(action)}
                  >
                    <Text style={styles.approveBtnText}>
                      ✓ Authorize & Contain [Simulated]
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}

        {activeTab === 'settings' && (
          <View style={styles.tabContent}>
            <View style={styles.settingsCard}>
              <Text style={styles.settingsLabel}>SOCFORGE API GATEWAY URL</Text>
              <TextInput
                style={styles.input}
                value={serverUrl}
                onChangeText={setServerUrl}
                placeholder="http://192.168.1.100:8000"
                placeholderTextColor={Colors.textMuted}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={() => {
                  setApiBaseUrl(serverUrl);
                  loadData();
                  Alert.alert('Configuration Updated', `Connecting to ${serverUrl}`);
                }}
              >
                <Text style={styles.saveBtnText}>Save & Test Endpoint</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.settingsCard}>
              <Text style={styles.settingsLabel}>DEVICE SECURITY & ATTRIBUTION</Text>
              <Text style={styles.infoRow}>Author: Sandeep Mothukuri</Text>
              <Text style={styles.infoRow}>Repository: github.com/sandeepmothukuri/socforge</Text>
              <Text style={styles.infoRow}>Engine: FastAPI Core v1.0.0</Text>
              <Text style={styles.infoRow}>Platform: SOCForge Mobile Triage</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Confirmation Modal for Response Approval */}
      <Modal
        visible={selectedAction !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedAction(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>CONFIRM CONTAINMENT ACTION</Text>
            <Text style={styles.modalText}>
              Are you sure you want to approve{' '}
              <Text style={{ color: Colors.cyan, fontWeight: 'bold' }}>
                {selectedAction?.action_type.toUpperCase()}
              </Text>{' '}
              on target:
            </Text>
            <Text style={styles.modalTarget}>{selectedAction?.target}</Text>
            <Text style={styles.modalSub}>
              This will issue an immediate network/credential isolation command
              via the containment adapter.
            </Text>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#1e293b' }]}
                onPress={() => setSelectedAction(null)}
              >
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: Colors.red }]}
                onPress={handleApprove}
                disabled={approving}
              >
                <Text style={[styles.modalBtnText, { color: '#fff' }]}>
                  {approving ? 'Executing...' : 'Authorize'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('dashboard')}
        >
          <Text style={[styles.navIcon, activeTab === 'dashboard' && styles.navActive]}>
            📊
          </Text>
          <Text style={[styles.navLabel, activeTab === 'dashboard' && styles.navActive]}>
            Dashboard
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('alerts')}
        >
          <Text style={[styles.navIcon, activeTab === 'alerts' && styles.navActive]}>
            🚨
          </Text>
          <Text style={[styles.navLabel, activeTab === 'alerts' && styles.navActive]}>
            Alerts ({alerts.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('responses')}
        >
          <Text style={[styles.navIcon, activeTab === 'responses' && styles.navActive]}>
            🛡️
          </Text>
          <Text style={[styles.navLabel, activeTab === 'responses' && styles.navActive]}>
            Ledger ({pendingActions})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('settings')}
        >
          <Text style={[styles.navIcon, activeTab === 'settings' && styles.navActive]}>
            ⚙️
          </Text>
          <Text style={[styles.navLabel, activeTab === 'settings' && styles.navActive]}>
            Settings
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bgDark,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: '#070d19',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandShield: {
    fontSize: 24,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  brandSub: {
    fontSize: 10,
    color: Colors.cyan,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
    paddingBottom: 32,
  },
  defconCard: {
    backgroundColor: '#1a0d14',
    borderWidth: 1,
    borderColor: '#7f1d1d',
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
  },
  defconHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  defconTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.red,
    letterSpacing: 0.5,
  },
  defconBadge: {
    fontSize: 10,
    fontWeight: '700',
    backgroundColor: Colors.red,
    color: '#fff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  defconBody: {
    fontSize: 12,
    color: '#fca5a5',
    lineHeight: 18,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  metricCard: {
    flex: 1,
    backgroundColor: Colors.cardBg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  metricVal: {
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  metricSub: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  sectionHeader: {
    marginTop: 16,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  actionBtn: {
    backgroundColor: '#0c2438',
    borderWidth: 1,
    borderColor: '#0284c7',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  actionBtnText: {
    color: '#e0f2fe',
    fontSize: 13,
    fontWeight: '700',
  },
  filterBar: {
    marginBottom: 14,
  },
  filterChip: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderColor: Colors.cyan,
  },
  filterChipText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '700',
  },
  filterChipTextActive: {
    color: Colors.cyan,
  },
  alertCard: {
    backgroundColor: Colors.cardBg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
  },
  alertTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  sevBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  sevText: {
    fontSize: 10,
    fontWeight: '800',
  },
  alertSource: {
    fontSize: 11,
    color: Colors.textMuted,
    fontFamily: 'monospace',
  },
  alertTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  alertDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 8,
    lineHeight: 16,
  },
  alertFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingTop: 8,
  },
  mitreTag: {
    fontSize: 10,
    color: Colors.cyan,
    fontFamily: 'monospace',
  },
  alertTime: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  ledgerHeader: {
    marginBottom: 14,
  },
  ledgerTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  ledgerSub: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  responseCard: {
    backgroundColor: Colors.cardBg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
  },
  responseTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  actionType: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.cyan,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  targetName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  requestedBy: {
    fontSize: 10,
    color: Colors.textMuted,
    marginBottom: 10,
  },
  approveBtn: {
    backgroundColor: '#166534',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  approveBtnText: {
    color: '#dcfce7',
    fontSize: 12,
    fontWeight: '700',
  },
  settingsCard: {
    backgroundColor: Colors.cardBg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 14,
    marginBottom: 14,
  },
  settingsLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#070d19',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: Colors.textPrimary,
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 10,
  },
  saveBtn: {
    backgroundColor: '#0284c7',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  infoRow: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  navBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: '#070d19',
    paddingVertical: 6,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  navIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  navLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  navActive: {
    color: Colors.cyan,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    width: '100%',
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.red,
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  modalText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  modalTarget: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  modalSub: {
    fontSize: 11,
    color: Colors.textMuted,
    marginBottom: 18,
    lineHeight: 16,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  modalBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
});
