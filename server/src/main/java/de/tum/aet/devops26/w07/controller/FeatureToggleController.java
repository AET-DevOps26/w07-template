package de.tum.aet.devops26.w07.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class FeatureToggleController {

    // A map to store feature toggles and their states
    private static final Map<String, Boolean> featureToggles = new HashMap<>();

    /**
     * Get the state of a feature toggle
     *
     * @param featureName the name of the feature toggle (e.g., "new-recommendation-system")
     * @return the state of the feature toggle (true if enabled, false if disabled)
     */
    @GetMapping("/features/{featureName}")
    public ResponseEntity<Boolean> getFeatureToggleState(@PathVariable("featureName") String featureName) {
        // TODO Return the state of the feature toggle if it exists, otherwise return false
        return ResponseEntity.ok(false);
    }

    /**
     * Set the state of a feature toggle
     *
     * @param featureName the name of the feature toggle (e.g., "new-recommendation-system")
     * @param enabled     true to enable the feature, false to disable it
     * @return the updated state of the feature toggle
     */
    @PutMapping("/features/{featureName}")
    public ResponseEntity<Boolean> setFeatureToggleState(@PathVariable("featureName") String featureName, boolean enabled) {
        // TODO Set the state of the feature toggle and return the updated state
        return ResponseEntity.ok(false);
    }
}
