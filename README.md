# PowerEdge IPMI Exporter for Prometheus
Prometheus OEM-specific IPMI data exporter for Dell PowerEdge servers.
This exporter was developed to work with the R710, but may work with other PowerEdge servers.

# Requirements
- Will probably only work on Linux at the moment
- A working Node.js environment
- FreeIPMI must be installed, with its executables available via $PATH

# Usage
```bash
# Bash
./bin/poweredge_exporter
```
or
```
node dist
```

# Config
A few things can be configured via `config.json`.
