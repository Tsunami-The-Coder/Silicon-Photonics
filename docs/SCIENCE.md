# Scientific choices

The scene depicts one generic 2.5D co-packaged optical I/O architecture. It does not reproduce a particular vendor's stack or performance claims.

## Physical hierarchy

- Package substrate: support, board interface and electrical routing.
- Electrical interposer: dense electrical connections between dies. Optical interposers are possible in other architectures.
- Microbumps: representative electrical/power contacts, deliberately enlarged.
- Compute die: electronic computation.
- Optical engines: PICs and supporting electronics, drawn adjacent in this example. Other products use stacking or co-integration.
- PIC SOI stack: patterned device silicon, buried oxide and silicon handle; cladding and many process details are simplified.

## Signal topology

The external continuous-wave laser supplies optical carriers to a transmitter. Electrical data drives modulators. Modulated wavelength channels share an output guide/fiber to a remote receiver. Incoming optical data from a remote transmitter uses a separate receive path. Receive filters separate wavelengths before Ge detectors and TIAs.

In the circuit view the upper bus is TX, left to right; the lower bus is RX, right to left. The two banks are functions of an optical engine, not an optical connection through the GPU. RX rings are filters, while the TX rings are driven modulators. Curves crossing the schematic coupling gap visualize transfer; coupling itself is electromagnetic, not a mechanical junction.

## Teaching conventions

Visible channel colors represent invisible infrared wavelengths. λ₁–λ₄ use illustrative 1548, 1550, 1552 and 1554 nm values, not a product channel plan. WDM channels share the same physical guide even though strands are slightly displaced for readability. Dots are slowed signal markers, not individual photons. Turning channels off changes a simple `N × 25 Gb/s` gross-rate example; it is not a simulated link performance prediction.

Exaggerated geometry makes microscopic structures visible. No quantitative BER, eye, mode, thermal, power, coupling or EM simulation is implemented. Real transceivers require additional controls, power delivery, biasing, packaging and recovery circuitry.

## Content provenance

The user's `Guide Book.pdf` (75 pages) and `Reference Book for Gudie.md` provide the educational outline. Relevant sections: SOI pp.12–13; sources pp.17–18; modulation/rings pp.19–25; WDM pp.26–28; receiver pp.29–34; integration pp.38–43; worked examples pp.52–55. Numerical examples are illustrative. These original files are not bundled for distribution.

Primary references used to cross-check the architecture:

1. https://www.imeciclink.com/en/asic-fabrication/silicon-photonics-foundry-services
2. https://www.imec-int.com/en/articles/interfacing-silicon-photonics-high-density-co-packaged-optics
3. https://www.nature.com/articles/s41467-024-44750-0
4. https://ayarlabs.com/products/
5. https://optoelectronics.ece.ucsb.edu/index.php/research

The UI's source dialog and component inspector link to these references. Guide page references identify sections in the user's provided learning material; they do not imply each illustrative number is a measured result.
