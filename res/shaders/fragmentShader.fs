uniform sampler2D texture;
uniform sampler2D black;
uniform float intensity;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;

void main() {

  vec4 tColor = texture2D(texture, vUv);
  vec4 tColor2 = texture2D(black, vUv);

  // hack in a fake pointlight at camera location, plus ambient
  vec3 normal = normalize(vNormal);
  vec3 lightDir = normalize(vViewPosition);

  if (intensity > 0.5) {
    float dotProduct = max(dot(normal, lightDir), 0.0) + 0.2;
    gl_FragColor = vec4(mix(tColor2.rgb, tColor.rgb, intensity), 1) *
      dotProduct;
  } else {
    gl_FragColor = vec4(mix(tColor2.rgb, tColor.rgb, intensity), 1);
  }

}
