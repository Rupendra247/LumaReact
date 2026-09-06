import { PENDULUM } from '../utils/constants'

export function stepPendulum(state, dt, params = PENDULUM) {
  const acc = -params.stiffness * state.angle - params.damping * state.angularVel
  const angularVel = state.angularVel + acc * dt
  const angle = state.angle + angularVel * dt
  return { angle, angularVel }
}