export module Style {

    export const current = {

        smufl(size: number): { fontFamily: string, fontSize: number } {
            return {
                fontFamily: this.smuflFont,
                fontSize: size
            };
        },

        smuflFont: "Bravura",
        scale: 1.0,

        row: {
            preferredBarsPerRow: 3,
            fillEmptySpaceForLastRow: true
        },

        bar: {
            horizontalPadding: 24,
            minBeatSpacing: 10,
            maxBeatSpacingRatio: 4,
            lineHeight: 12,
            ceilingSpacing: 12,
            floorSpacing: 12,
            horizontalLineThickness: 1
        },

        barLine: {
            thinLineThickness: 1,
            thickLineThickness: 4,
            lineSpacing: 3,
            repeatSpacing: 2,
            repeatDotRadius: 2
        },

        note: {
            head: {
                alternationOffsetWithHarmonics: 20,
                alternationOffset: 12,
                margin: 2,
                capsulePadding: 1
            },
            stem: {
                standardHeight: 24,
                minimumEpitaxy: 16,
                horizontalMargin: 10,
                thickness: 1
            },
            tremoloOffset: 12,
            modifierMargin: 6,
            size: 12,
            restSize: 38
        },

        beam: {
            minimumVerticalPadding: 6,
            connectorThickness: 4,
            connectorSpacing: 4,
            maximumSemiBeamWidth: 12
        }
    }
};