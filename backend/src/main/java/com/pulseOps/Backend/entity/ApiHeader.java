package com.pulseOps.Backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

@Embeddable
public class ApiHeader {

    @Column(name = "header_key", length = 190)
    private String key = "";

    @Column(name = "header_value", length = 1024)
    private String value = "";

    protected ApiHeader() {
    }

    public ApiHeader(String key, String value) {
        this.key = key == null ? "" : key;
        this.value = value == null ? "" : value;
    }

    public String getKey() { return key; }
    public void setKey(String key) { this.key = key; }
    public String getValue() { return value; }
    public void setValue(String value) { this.value = value; }
}
