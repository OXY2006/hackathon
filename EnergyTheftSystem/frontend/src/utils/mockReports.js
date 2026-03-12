export const MOCK_REPORTS = [
  {
    primaryHypothesis: "The consumer is likely employing a **manual bypass or 'jumper' mechanism** used in conjunction with a **shunting device**, allowing them to selectively divert heavy loads around the meter during peak usage hours.",
    supportingEvidence: [
      { title: "usage_variance", value: "78.432", impact: "0.241", explanation: "The extreme volatility suggests loads are being manually 'switched' between metered and unmetered states." },
      { title: "max_draw_kw", value: "94.210", impact: "0.185", explanation: "Anomalous spikes trigger risk thresholds, pointing to an external unmetered heavy load." }
    ],
    recommendedActions: [
      "Dispatch a field inspection team to physically examine the meter and wiring for jumper cables.",
      "Compare current consumption patterns with historical usage for the same billing period.",
      "Flag this account for the next billing audit cycle and escalate to revenue protection."
    ]
  },
  {
    primaryHypothesis: "The meter is experiencing periodic complete isolation from the circuit. This is characteristic of a **remote-controlled relay or physical bridge** that completely halts metered consumption during the night.",
    supportingEvidence: [
      { title: "zero_consumption_hours", value: "14.000", impact: "0.312", explanation: "These streaks indicate periods where the meter is isolated, pointing toward a 'stop-start' tampering method." },
      { title: "voltage_drop", value: "12.450", impact: "0.155", explanation: "Significant voltage drops align with periods of zero consumption, suggesting a heavy load is bypassing the meter." }
    ],
    recommendedActions: [
      "Inspect the meter seal and casing for evidence of tampering or relay installations.",
      "Cross-reference zero-consumption windows with smart-meter logs and transformer data.",
      "Install a secondary revenue-grade CT meter in parallel for a 30-day audit comparison."
    ]
  },
  {
    primaryHypothesis: "Analysis reveals a **magnetic interference anomaly** where the meter's current transformers (CTs) are being saturated by an external neodymium magnet, artificially slowing down the registration disc or solid-state sensors.",
    supportingEvidence: [
      { title: "magnetic_field_disturbance", value: "85.120", impact: "0.450", explanation: "A sudden, prolonged drop in recorded reactive power (kVARh) typically indicates external magnetic tampering." },
      { title: "power_factor_drop", value: "0.410", impact: "0.220", explanation: "An unexplained plunge in power factor coincides with the suspected tampering intervals." }
    ],
    recommendedActions: [
      "Deploy field agents equipped with gaussmeters to detect residual magnetic fields near the meter enclosure.",
      "Replace the existing meter with an anti-magnetic or shielded smart meter model.",
      "Analyze historical billing to quantify the lost revenue during the interference period."
    ]
  },
  {
    primaryHypothesis: "The telemetry points toward **neutral line disconnection or grounding tampering**. The consumer is likely using earth routing to return current, bypassing the meter's neutral measurement.",
    supportingEvidence: [
      { title: "neutral_current_imbalance", value: "45.670", impact: "0.380", explanation: "The significant difference between phase and neutral currents is a classic signature of partial earth-return tampering." },
      { title: "earth_leakage_events", value: "12.000", impact: "0.190", explanation: "Frequent recorded earth leakage flags match the unauthorized grounding." }
    ],
    recommendedActions: [
      "Inspect the premises for unauthorized ground rods or connections to water pipes.",
      "Install a dual-element meter that measures both phase and neutral currents.",
      "Initiate a safety audit, as unauthorized earth returns pose serious electrocution hazards."
    ]
  },
  {
    primaryHypothesis: "We have detected a sophisticated **Phase-Shifting attack**. The consumer has installed phase-shifting capacitors to artificially inject reactive power that confuses the meter's active power (kWh) calculation.",
    supportingEvidence: [
      { title: "reactive_power_surge", value: "102.50", impact: "0.410", explanation: "Unnatural spikes in capacitive reactive power are distorting the metered load." },
      { title: "harmonic_distortion", value: "18.300", impact: "0.290", explanation: "Third and fifth-order harmonics are elevated, heavily indicating unregulated capacitor banks." }
    ],
    recommendedActions: [
      "Conduct a specialized power quality audit at the connection point.",
      "Review the site for illegal industrial-grade capacitor installations.",
      "Recalculate billing based on apparent power (kVAh) rather than active power (kWh)."
    ]
  },
  {
    primaryHypothesis: "The data footprint indicates the use of an **Electronic Load Blocker (Inverter Backfeed Tamper)**. Energy from a hidden battery or solar inverter is being illegally pushed back into the grid to run the meter backwards.",
    supportingEvidence: [
      { title: "reverse_current", value: "22.400", impact: "0.340", explanation: "Negative consumption values during peak sun hours suggest unauthorized local generation pushing into the grid." },
      { title: "voltage_swell", value: "254.10", impact: "0.120", explanation: "Grid voltage is elevated at the connection point due to un-synchronized inverter backfeed." }
    ],
    recommendedActions: [
      "Verify if the account is registered as a prosumer (net-metering). If not, it is an illegal feed.",
      "Check for unapproved grid-tied solar inverters or battery discharge systems.",
      "Install a unidirectional meter with reverse-current locking."
    ]
  },
  {
    primaryHypothesis: "The profile is consistent with **Direct Line Tapping (Hooking)** before the meter. A secondary, highly variable load is connected directly to the overhead distribution lines.",
    supportingEvidence: [
      { title: "line_loss_discrepancy", value: "15.800", impact: "0.460", explanation: "The distribution transformer output significantly exceeds the sum of all connected smart meters in this sector." },
      { title: "phase_imbalance", value: "8.900", impact: "0.210", explanation: "One specific phase shows a drastic droop, pointing to an unbalanced tapped load." }
    ],
    recommendedActions: [
      "Deploy drone inspection or line-crew to check the overhead service drop for illegal hooks.",
      "Analyze the upstream distribution transformer telemetry for exact theft timing.",
      "Involve local authorities for immediate disconnection of the hazardous illegal tap."
    ]
  },
  {
    primaryHypothesis: "The analysis strongly suggests **Smart Meter Firmware Tampering (Optical Port Attack)**. The meter's internal calibration parameters appear to have been maliciously altered via its diagnostic port.",
    supportingEvidence: [
      { title: "calibration_checksum_error", value: "1.000", impact: "0.520", explanation: "The internal multiplier constant shows a checksum mismatch with the utility database." },
      { title: "optical_port_login_attempts", value: "45.000", impact: "0.280", explanation: "Multiple failed and successful unrecognized login attempts recorded in the meter's flash memory." }
    ],
    recommendedActions: [
      "Immediately replace the compromised meter and bring the unit to the lab for forensic analysis.",
      "Force a remote firmware OTA (Over The Air) update to all meters in the local cluster.",
      "Investigate potential insider threats or compromised optical-probe access codes."
    ]
  },
  {
    primaryHypothesis: "This node demonstrates **Time-of-Use (TOU) Tariff Arbitrage Tampering**. The meter's internal real-time clock (RTC) is being artificially manipulated to register peak usage as off-peak usage.",
    supportingEvidence: [
      { title: "rtc_drift", value: "845.00", impact: "0.415", explanation: "The meter's internal clock has drifted by over 14 hours compared to the network time server." },
      { title: "off_peak_surge", value: "98.200", impact: "0.275", explanation: "Massive industrial-scale load is exclusively registering during the cheapest simulated tariff hours." }
    ],
    recommendedActions: [
      "Push a forced time-sync command to the meter via the AMI network.",
      "Calculate the tariff difference for the past 6 months to exact the financial penalty.",
      "Inspect the meter for external clock-slowing devices (e.g., crystal oscillator cooling)."
    ]
  },
  {
    primaryHypothesis: "The data suggests the presence of a **Current Transformer (CT) Shorting Link**. The CT secondary wires inside the meter box have likely been bridged with a concealed copper wire.",
    supportingEvidence: [
      { title: "current_ratio_drop", value: "66.500", impact: "0.490", explanation: "The recorded current dropped instantly to exactly 33% of historical norms, indicative of one or two phases being shunted." },
      { title: "steady_voltage", value: "230.10", impact: "0.110", explanation: "Voltage remains perfectly stable despite the massive artificial drop in current, confirming it is a measurement tamper, not a load change." }
    ],
    recommendedActions: [
      "Break the utility seal and inspect the meter terminal block for hidden wire strands.",
      "Perform a CT ratio test with a calibrated portable load bank.",
      "Seal the meter enclosure with advanced tamper-evident cryptographic seals."
    ]
  },
  {
    primaryHypothesis: "The telemetry points to an **Energy Routing Relay (Load Splitter)**. The consumer has split their household wiring to run basic lighting through the meter, while routing heavy appliances (HVAC, EV chargers) directly to the mains.",
    supportingEvidence: [
      { title: "base_load_only", value: "92.000", impact: "0.380", explanation: "The meter only registers a flat, low-variance base load (lights/fridge), completely missing the expected signatures of heavy heating or cooling." },
      { title: "temperature_divergence", value: "14.500", impact: "0.220", explanation: "Despite a severe local heatwave, the cooling load signature is entirely absent from the smart meter data." }
    ],
    recommendedActions: [
      "Perform a full premise wiring audit, tracing the mains from the street to the main breaker.",
      "Compare the visible appliance load (AC units, EV chargers) against the registered meter capacity.",
      "Relocate the meter to an external, utility-controlled property boundary pole."
    ]
  },
  {
    primaryHypothesis: "We are observing a **High-Frequency Jamming Attack**. A device emitting intense radio frequency (RF) noise is placed near the smart meter, disrupting the metrology chip's analog-to-digital converters.",
    supportingEvidence: [
      { title: "adc_conversion_errors", value: "1250.0", impact: "0.430", explanation: "The metrology IC is throwing thousands of conversion errors per hour, causing it to drop energy packets." },
      { title: "通信_packet_loss", value: "41.200", impact: "0.190", explanation: "The RF mesh network also shows a 41% packet loss for this specific node, confirming localized RF interference." }
    ],
    recommendedActions: [
      "Send an investigator with an RF spectrum analyzer to locate the jamming source.",
      "Upgrade the endpoint to a fiber-optic or hardwired PLC communication module.",
      "Ensure the meter's internal shielding is compliant with EMI/EMC regulations."
    ]
  },
  {
    primaryHypothesis: "The consumption pattern matches an **Illegal Cryptomining Operation**. The load is drawn continuously at exactly 99% of the breaker's capacity, 24/7, with extreme thermal signatures, yet metered consumption is suspiciously low.",
    supportingEvidence: [
      { title: "load_factor_max", value: "0.995", impact: "0.470", explanation: "The load profile is perfectly flat and continuously maxed out, characteristic of ASIC miners rather than human behavior." },
      { title: "thermal_sensor_alert", value: "85.200", impact: "0.240", explanation: "The meter's internal temperature sensor is reporting dangerous levels of sustained heat." }
    ],
    recommendedActions: [
      "Coordinate with local law enforcement, as large-scale undetected mining often pairs with massive bypasses.",
      "Use thermal imaging drones to scan the property roof for excessive heat exhaust.",
      "Immediately de-energize the transformer to prevent a catastrophic thermal blowout."
    ]
  },
  {
    primaryHypothesis: "The data shows classic signs of **Meter Reversal (Upside Down Installation)**. The meter has been physically detached and plugged back in backward, causing the mechanical or digital registers to count in reverse.",
    supportingEvidence: [
      { title: "negative_cumulative_kwh", value: "1.000", impact: "0.550", explanation: "The cumulative energy register is decreasing day over day without any registered solar generation." },
      { title: "tamper_switch_triggered", value: "1.000", impact: "0.310", explanation: "The physical case-open tamper microswitch was triggered 3 days ago at 2:00 AM." }
    ],
    recommendedActions: [
      "Dispatch a crew to physically re-orient and securely lock the meter into its socket.",
      "Retrieve the last known good reading to estimate the stolen energy.",
      "Evaluate the deployment of meters with unidirectional registers and accelerometer tiltsensors."
    ]
  },
  {
    primaryHypothesis: "The analysis strongly indicates a **Voltage Coil Disconnection**. A tiny hole has likely been drilled into the casing to sever the thin voltage reference wire, tricking the meter into calculating zero power even when current flows.",
    supportingEvidence: [
      { title: "zero_voltage_registered", value: "0.000", impact: "0.490", explanation: "The meter reports 0 Volts across phase A, but current is still flowing, which is physically impossible without tampering." },
      { title: "power_calculation_fail", value: "1.000", impact: "0.260", explanation: "The internal P = V * I calculation evaluates to zero, leading to 100% unbilled energy." }
    ],
    recommendedActions: [
      "Examine the outer casing of the meter for micro-drilled holes or heated pin insertions.",
      "Replace the meter with one containing self-healing circuits and redundant voltage taps.",
      "Calculate unbilled usage based on the historical amperage profile."
    ]
  }
];
